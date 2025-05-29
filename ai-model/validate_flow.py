from pymongo import MongoClient
import os

def validate_predictions(owner):
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DB_NAME")]
    predictions = list(db.predictions.find({"owner": owner}))
    
    print(f"\n🔍 Validation Report for {owner}:")
    print(f"Found {len(predictions)} predictions")
    if predictions:
        latest = max(predictions, key=lambda x: x['timestamp'])
        print("Latest Prediction:")
        print(f"Month: {latest['month']}")
        print(f"Production: {latest['production']}kg")
        print(f"Earnings: Rs.{latest['earnings']}")
        print(f"Confidence: {latest['confidence']}")