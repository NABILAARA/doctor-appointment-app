import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? (user.type === "admin" ? <AdminDashboard /> : <UserDashboard />) : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;