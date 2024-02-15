import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/Users/Register";
import Login from "./components/Users/Login";
import Dashboard from "./components/Users/Dashboard";
import PrivateNavbar from "./components/Navbar/PrivateNavbar";
import PublicNavbar from "./components/Navbar/PublicNavbar";
import Home from "./components/Home/Home";
import { useAuth } from "./AuthContext/AuthContext";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import BlogPostAIAssistant from "./components/ContentGeneration/ContentGeneration";
import Plans from "./components/Plans/Plan";
import FreePlanSignup from "./components/StripePayment/FreePlanSignup";
import CheckoutForm from "./components/StripePayment/CheckOutForm";
import PaymentSuccess from "./components/StripePayment/PaymentSuccess";
import ContentGenerationHistory from "./components/ContentGeneration/ContentHistory";


export default function App() {
  const {isAuthenticated} = useAuth();

  return (
    <div className="App">
      <BrowserRouter>
      {isAuthenticated ? <PrivateNavbar />:<PublicNavbar/> }
      <Routes>
        <Route path="/register" element={<Registration />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/dashboard" element={
          <AuthRoute>
            <Dashboard />
          </AuthRoute>
        }/>
        <Route path="/generate-content" element={
          <AuthRoute>
            <BlogPostAIAssistant />
          </AuthRoute>
        }/>
        <Route path="/history" element={
          <AuthRoute>
            <ContentGenerationHistory />
          </AuthRoute>
        }/>
        <Route path="/" element={<Home />}/>
        <Route path="/plans" element={<Plans />}/>
        <Route path="/free-plan" element={<FreePlanSignup />}/>
        <Route path="/checkout/:plan" element={<CheckoutForm />}/>
        <Route path="/success" element={<PaymentSuccess />}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

