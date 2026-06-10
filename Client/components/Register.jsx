import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", type: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/user/register", form);
      if (res.data.success) {
        navigate("/login");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Account 📝</h2>
      {error && <div style={{ color: "#dc2626", textAlign: "center", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Full Name</label><input required onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
        <div className="form-group"><label>Email</label><input type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label>Password</label><input type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <div className="form-group"><label>Phone</label><input onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="form-group"><label>Register as</label><select onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="user">Patient</option><option value="admin">Admin</option></select></div>
        <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        <p style={{ textAlign: "center", marginTop: "15px" }}>Have account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
