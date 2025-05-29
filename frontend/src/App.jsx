import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FactoryManagerLogin from "./login_singup/FactoryManagerLogin";
import FactoryManagerDashboard from "./components/FactoryManagerDashboard";
import TrasportLogin from "./login_singup/Trasport_login";
import TeaGardenOwnerLogin from "./login_singup/TeaGardenOwnerLogin copy";
import TeaGardenOwnerDashboard from "./components/TeaGardenOwnerDashboard";
import TransportDashboard from "./components/TrasportDashbord";
import InventoryPage from "./components/InventoryPage";
import "./index.css";
import Distribution from "./components/Distribution";
import FactoryPayments from "./components/FactoryPayments";
import MonthlyFactory from "./components/MonthlyFactory";
import AboutUsPage from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import "bootstrap/dist/css/bootstrap.min.css";
import Weather from "./components/Weather";
function App() {
  const [user, setUser] = useState(null); // State to manage the logged-in user

  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login/factory-manager"
            element={<FactoryManagerLogin setUser={setUser} />}
          />
          <Route
            path="/Factory-Manager-Dashboard"
            element={<FactoryManagerDashboard user={user} />}
          />
          <Route
            path="/login/tea-garden-owner"
            element={<TeaGardenOwnerLogin setUser={setUser} />}
          />
          <Route
            path="/Trasport_login"
            element={<TrasportLogin setUser={setUser} />}
          />
          <Route
            path="/TeaGardenOwnerDashboard"
            element={<TeaGardenOwnerDashboard user={user} />}
          />
          <Route
            path="/TransportDashboard"
            element={<TransportDashboard user={user} />}
          />

          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/distribution" element={<Distribution user={user} />} />

          <Route
            path="/factory-payments"
            element={<FactoryPayments user={user} />}
          />

          <Route
            path="/monthly-report"
            element={<MonthlyFactory user={user} />}
          />

          <Route path="/AboutUs" element={<AboutUsPage />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/weather" element={<Weather user={user} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
