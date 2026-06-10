import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">🏥 MediCareBook</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ fontSize: "3rem", color: "#1e293b" }}>Your Health, Our Priority</h1>
        <p style={{ fontSize: "1.2rem", color: "#64748b", marginTop: "20px" }}>Book appointments with trusted doctors instantly</p>
        <Link to="/register" className="btn-primary" style={{ display: "inline-block", marginTop: "30px" }}>Get Started →</Link>
      </div>
      <footer className="footer">© 2024 MediCareBook. All rights reserved.</footer>
    </>
  );
};

export default Home;
