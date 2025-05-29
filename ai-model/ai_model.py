
   
import os
import pymongo
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.dummy import DummyRegressor
from sklearn.model_selection import train_test_split, TimeSeriesSplit, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.base import BaseEstimator, TransformerMixin
import joblib
from pathlib import Path
from datetime import datetime
import warnings
import sys
import io

# Configure encoding and warnings
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
warnings.filterwarnings("ignore")
load_dotenv()

# Constants
MODEL_DIR = Path('models')
MODEL_DIR.mkdir(exist_ok=True)

# ----------- DATA LOADER -----------
class DataLoader:
    def load_data(self):
        """Load and clean data from MongoDB with quality checks"""
        print("\n" + "="*50)
        print("DATA ACQUISITION & VALIDATION")
        print("="*50)
        
        try:
            client = pymongo.MongoClient(os.getenv("MONGO_URI"))
            db = client[os.getenv("DB_NAME")]
            collection = db[os.getenv("COLLECTION_NAME")]
            
            target_owner = os.getenv("PREDICTION_OWNER")
            query = {"gardenOwner": target_owner} if target_owner else {}
            
            print(f"Fetching {'owner-specific ' if target_owner else ''}raw data...")
            raw_data = list(collection.find(query))
            
            if not raw_data:
                print("No data found for the specified owner" if target_owner else "No data found in collection")
                return pd.DataFrame(columns=['owner', 'date', 'production', 'earnings'])
            
            df = pd.DataFrame(raw_data).rename(columns={
                'gardenOwner': 'owner',
                'teaKilos': 'production',
                'transportDate': 'date',
                'pricePerKg': 'price'
            })
            
            df['date'] = pd.to_datetime(df['date'])
            df['earnings'] = df['production'] * df['price']
            df = df.sort_values(['owner', 'date'])
            
            print("\nData Quality Report:")
            print(f"Columns found: {df.columns.tolist()}")
            print(f"Total records: {len(df)}")
            print(f"Time range: {df['date'].min().date()} to {df['date'].max().date()}")
            
            valid_owners = df.groupby('owner').filter(lambda x: len(x) >= 3)
            removed = len(df) - len(valid_owners)
            print(f"\nRemoved {removed} records from owners with <3 entries")
            
            return valid_owners[['owner', 'date', 'production', 'earnings']]
            
        except Exception as e:
            print(f"DATA LOAD ERROR: {str(e)}")
            raise

# ----------- FEATURE ENGINEERING -----------
class FeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.lags = [1, 2, 3]
        
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        """Create enhanced features with seasonality and trends"""
        processed = []
        for owner, group in X.groupby('owner'):
            group = group.sort_values('date')
            
            # Lag features
            for lag in self.lags:
                group[f'prod_lag_{lag}'] = group['production'].shift(lag)
                group[f'earn_lag_{lag}'] = group['earnings'].shift(lag)
            
            # Rolling statistics
            window = min(3, len(group)-1)
            group['prod_rolling_mean'] = group['production'].rolling(window).mean()
            group['prod_rolling_std'] = group['production'].rolling(window).std()
            group['prod_trend'] = group['production'].rolling(window).apply(
                lambda x: np.polyfit(range(len(x)), x, 1)[0], raw=True)
            
            # Time features
            group['month'] = group['date'].dt.month
            group['season'] = (group['month'] % 12) // 3
            group['year'] = group['date'].dt.year
            
            # Owner-level features
            if len(group) > 5:
                group['owner_avg_prod'] = group['production'].expanding().mean()
            
            # Targets
            group['target_production'] = group['production'].shift(-1)
            group['target_earnings'] = group['earnings'].shift(-1)
            
            processed.append(group)
        
        combined = pd.concat(processed)
        return combined.dropna()

# ----------- MODEL TRAINER -----------
class ModelTrainer:
    def __init__(self):
        self.models = {
            'production': {
                'rf': RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42),
                'linear': LinearRegression()
            },
            'earnings': {
                'rf': RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42),
                'linear': LinearRegression()
            }
        }
        self.best_models = {
            'production': None,
            'earnings': None
        }
    
    def evaluate_model(self, X, y, model, model_name, target_name):
        """Enhanced evaluation with baseline comparison"""
        print(f"\n{'='*30} {target_name.upper()} ({model_name}) {'='*30}")
        
        tscv = TimeSeriesSplit(n_splits=3)
        cv_scores = cross_val_score(model, X, y, cv=tscv, scoring='neg_mean_absolute_error')
        print(f"Cross-Validated MAE: {-cv_scores.mean():.2f} ± {cv_scores.std():.2f}")
        
        baseline = DummyRegressor(strategy='mean')
        baseline_scores = cross_val_score(baseline, X, y, cv=tscv, scoring='neg_mean_absolute_error')
        improvement = 100 * (baseline_scores.mean() - cv_scores.mean()) / abs(baseline_scores.mean())
        print(f"Improvement over baseline: {improvement:.1f}%")
        
        model.fit(X, y)
        return model
    
    def train_and_evaluate(self, X, y_prod, y_earn):
        """Train multiple model types with comparison"""
        print("\n" + "="*50)
        print("MODEL TRAINING")
        print("="*50)
        
        self.models['production']['linear'] = self.evaluate_model(
            X, y_prod, self.models['production']['linear'], 'Linear', 'Production')
        self.models['production']['rf'] = self.evaluate_model(
            X, y_prod, self.models['production']['rf'], 'Random Forest', 'Production')
        
        self.models['earnings']['linear'] = self.evaluate_model(
            X, y_earn, self.models['earnings']['linear'], 'Linear', 'Earnings')
        self.models['earnings']['rf'] = self.evaluate_model(
            X, y_earn, self.models['earnings']['rf'], 'Random Forest', 'Earnings')
        
        self.best_models = {
            'production': self.models['production']['rf'],
            'earnings': self.models['earnings']['rf']
        }

# ----------- PREDICTOR -----------
class Predictor:
    def __init__(self):
        self.trainer = ModelTrainer()
        self.feature_engineer = FeatureEngineer()
        self.feature_columns = None
        self.load_models()
        
    def load_models(self):
        """Load saved models with validation"""
        try:
            prod_path = MODEL_DIR / 'prod_model.pkl'
            if prod_path.exists():
                self.trainer.best_models['production'] = joblib.load(prod_path)
                print(f"Loaded production model from {prod_path}")
            else:
                print("No production model found")
                self.trainer.best_models['production'] = None

            earn_path = MODEL_DIR / 'earn_model.pkl'
            if earn_path.exists():
                self.trainer.best_models['earnings'] = joblib.load(earn_path)
                print(f"Loaded earnings model from {earn_path}")
            else:
                print("No earnings model found")
                self.trainer.best_models['earnings'] = None

        except Exception as e:
            print(f"Model load failed: {str(e)}")
            self.trainer = ModelTrainer()
    
    def save_models(self):
        """Persist trained models with error handling"""
        try:
            joblib.dump(self.trainer.best_models['production'], MODEL_DIR / 'prod_model.pkl')
            joblib.dump(self.trainer.best_models['earnings'], MODEL_DIR / 'earn_model.pkl')
            print("Models saved successfully")
        except Exception as e:
            print(f"Model save error: {str(e)}")
            raise
    
    def train(self, df):
        """Train models with enhanced features"""
        if df.empty:
            print("No data available for training")
            return
            
        processed_df = self.feature_engineer.transform(df)
        self.feature_columns = processed_df.drop([
            'owner', 'date', 'target_production', 'target_earnings'
        ], axis=1, errors='ignore').columns.tolist()
        
        self.trainer.train_and_evaluate(
            processed_df[self.feature_columns],
            processed_df['target_production'],
            processed_df['target_earnings']
        )
        self.save_models()
    
    def predict(self, df):
        """Generate predictions with confidence estimates"""
        print("\n" + "="*50)
        print("PREDICTION RESULTS")
        print("="*50)
        
        if df.empty:
            print("No data available for prediction")
            return []
            
        # Validate models exist
        if not all(self.trainer.best_models.values()):
            print("Models not loaded - training new models")
            self.train(df)
            
        predictions = []
        target_owner = os.getenv("PREDICTION_OWNER")
        owners_to_predict = [target_owner] if target_owner else df['owner'].unique()
        
        for owner in owners_to_predict:
            group = df[df['owner'] == owner].sort_values('date')
            
            if len(group) == 0:
                print(f"No data found for owner: {owner}")
                predictions.append({
                    'owner': owner,
                    'month': (datetime.now() + pd.DateOffset(months=1)).strftime('%Y-%m'),
                    'production': 0,
                    'earnings': 0,
                    'confidence': "Unavailable",
                    'history_months': 0,
                    'timestamp': datetime.now()
                })
                continue
                
            last_date = group.iloc[-1]['date']
            next_month = last_date + pd.DateOffset(months=1)
            
            try:
                window = min(3, len(group))
                input_data = {
                    'prod_lag_1': group.iloc[-1]['production'],
                    'prod_lag_2': group.iloc[-2]['production'] if len(group) > 1 else 0,
                    'prod_lag_3': group.iloc[-3]['production'] if len(group) > 2 else 0,
                    'earn_lag_1': group.iloc[-1]['earnings'],
                    'earn_lag_2': group.iloc[-2]['earnings'] if len(group) > 1 else 0,
                    'earn_lag_3': group.iloc[-3]['earnings'] if len(group) > 2 else 0,
                    'prod_rolling_mean': group['production'].rolling(window).mean().iloc[-1],
                    'prod_rolling_std': group['production'].rolling(window).std().iloc[-1],
                    'prod_trend': group['production'].rolling(window).apply(
                        lambda x: np.polyfit(range(len(x)), x, 1)[0], raw=True).iloc[-1],
                    'month': next_month.month,
                    'season': (next_month.month % 12) // 3,
                    'year': next_month.year,
                    'owner_avg_prod': group['production'].mean() if len(group) > 5 else 0
                }
                
                input_features = pd.DataFrame([input_data], columns=self.feature_columns)
                
                # Generate predictions
                prod_pred = max(0, round(self.trainer.best_models['production'].predict(input_features)[0], 1))
                earn_pred = max(0, round(self.trainer.best_models['earnings'].predict(input_features)[0], 2))
                
                # Determine confidence
                if len(group) < 3:
                    confidence = "Low"
                    prod_pred *= 0.9
                    earn_pred *= 0.9
                elif len(group) < 6:
                    confidence = "Medium"
                else:
                    confidence = "High"
                
                predictions.append({
                    'owner': owner,
                    'month': next_month.strftime('%Y-%m'),
                    'production': prod_pred,
                    'earnings': earn_pred,
                    'confidence': confidence,
                    'history_months': len(group),
                    'timestamp': datetime.now()
                })
                
            except Exception as e:
                print(f"Error predicting for {owner}: {str(e)}")
                predictions.append({
                    'owner': owner,
                    'month': next_month.strftime('%Y-%m'),
                    'production': 0,
                    'earnings': 0,
                    'confidence': "Unavailable",
                    'history_months': len(group),
                    'timestamp': datetime.now()
                })
        
        print("\nTea Garden Predictions for Next Time:")
        print("-" * 65)
        print(f"{'Owner':<15} {'Month':<10} {'Production (kg)':<15} {'Earnings (Rs)':<15} {'Confidence':<12} {'History'}")
        print("-" * 65)
        for pred in sorted(predictions, key=lambda x: -x['history_months']):
            print(f"{pred['owner']:<15} {pred['month']:<10} {pred['production']:<15.1f} {pred['earnings']:<15,.2f} {pred['confidence']:<12} {pred['history_months']} Rocords")
        
        return predictions
    
    def save_predictions(self, predictions):
        """Save predictions to MongoDB with error handling"""
        if not predictions:
            print("No predictions to save")
            return
            
        try:
            client = pymongo.MongoClient(os.getenv("MONGO_URI"))
            db = client[os.getenv("DB_NAME")]
            collection = db['predictions']
            
            print(f"\nSaving {len(predictions)} predictions to MongoDB...")
            
            delete_result = collection.delete_many({
                'month': {'$in': list({p['month'] for p in predictions})},
                'owner': {'$in': [p['owner'] for p in predictions]}
            })
            print(f"Deleted {delete_result.deleted_count} old predictions")
            
            insert_result = collection.insert_many(predictions)
            print(f"Successfully inserted {len(insert_result.inserted_ids)} predictions")
            
        except pymongo.errors.BulkWriteError as e:
            print(f"Partial save: {len(e.details['writeErrors'])} errors")
            for error in e.details['writeErrors']:
                print(f"Error: {error['errmsg']}")
                
        except Exception as e:
            print(f"Critical save error: {str(e)}")
            raise
            
        finally:
            if 'client' in locals():
                client.close()

# ----------- MAIN EXECUTION -----------
if __name__ == "__main__":
    print("\nTEA PRODUCTION PREDICTION SYSTEM")
    print("="*50)
    
    if os.getenv('FORCE_REFRESH'):
        print("\nFORCE REFRESH INITIATED - CLEARING CACHE")
        for f in MODEL_DIR.glob('*.pkl'):
            try:
                f.unlink()
                print(f"Removed cached model: {f.name}")
            except Exception as e:
                print(f"Error removing {f.name}: {str(e)}")
    
    try:
        loader = DataLoader()
        df = loader.load_data()
        
        predictor = Predictor()
        
        if not os.getenv("PREDICTION_OWNER"):
            predictor.train(df)
        
        predictions = predictor.predict(df)
        predictor.save_predictions(predictions)
        
        print("\nPREDICTIONS COMPLETED")
        
    except Exception as e:
        print(f"\nSYSTEM FAILURE: {str(e)}")
        sys.exit(1)



