import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/Users/Register";
import Login from "./components/Users/Login";
import Dashboard from "./components/Users/Dashboard";
import PrivateNavbar from "./components/Navbar/PrivateNavbar";
import PublicNavbar from "./components/Navbar/PublicNavbar";
import Home from "./components/Home/Home";
import { useAuth } from "./AuthContext/AuthContext";
import AuthRoute from "./components/AuthRoute/AuthRoute";



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
        <Route path="/" element={<Home />}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

