import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const docsRes = await axios.get("http://localhost:8000/api/admin/getalldoctors", { headers: { Authorization: `Bearer ${token}` } });
        if (docsRes.data.success) setDoctors(docsRes.data.data);
        const usersRes = await axios.get("http://localhost:8000/api/admin/getallusers", { headers: { Authorization: `Bearer ${token}` } });
        if (usersRes.data.success) setUsers(usersRes.data.data);
        const aptRes = await axios.get("http://localhost:8000/api/admin/getallappointments", { headers: { Authorization: `Bearer ${token}` } });
        if (aptRes.data.success) setAppointments(aptRes.data.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleApprove = async (doctorId, userId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8000/api/admin/approvedoctor", { doctorId, userId }, { headers: { Authorization: `Bearer ${token}` } });
      setDoctors(doctors.map(d => d._id === doctorId ? { ...d, status: "approved" } : d));
      alert("Doctor approved!");
    } catch (err) { alert("Failed"); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const pending = doctors.filter(d => d.status === "pending");
  const approved = doctors.filter(d => d.status === "approved");

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">👑 Admin Panel</div>
        <ul className="sidebar-menu">
          <li><a href="#" className={activeTab === "doctors" ? "active" : ""} onClick={() => setActiveTab("doctors")}>👨‍⚕️ Doctor Approvals</a></li>
          <li><a href="#" className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>👤 All Users</a></li>
          <li><a href="#" className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>📅 Appointments</a></li>
          <li><hr style={{ margin: "10px 0" }} /></li>
          <li><a href="#" onClick={handleLogout}>🚪 Logout</a></li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header-card"><h2>Admin Dashboard</h2><div className="avatar">A</div></div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{pending.length}</div><div>Pending Approvals</div></div>
          <div className="stat-card"><div className="stat-value">{approved.length}</div><div>Approved Doctors</div></div>
          <div className="stat-card"><div className="stat-value">{users.length}</div><div>Total Users</div></div>
          <div className="stat-card"><div className="stat-value">{appointments.length}</div><div>Total Appointments</div></div>
        </div>

        {activeTab === "doctors" && (
          <>
            <h3>⏳ Pending Approvals ({pending.length})</h3>
            <div className="table-container"><table><thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Action</th></tr></thead>
            <tbody>{pending.map(doc => (<tr key={doc._id}><td>Dr. {doc.fullName}</td><td>{doc.specialization}</td><td>{doc.experience} yrs</td><td>Rp {doc.fees}</td><td><button className="btn-primary" onClick={() => handleApprove(doc._id, doc.userId)}>Approve</button></td></tr>))}</tbody></table></div>
            <h3 style={{ marginTop: "30px" }}>✅ Approved Doctors ({approved.length})</h3>
            <div className="table-container"><table><thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Status</th></tr></thead>
            <tbody>{approved.map(doc => (<tr key={doc._id}><td>Dr. {doc.fullName}</td><td>{doc.specialization}</td><td>{doc.experience} yrs</td><td>Rp {doc.fees}</td><td><span className="badge badge-success">Approved</span></td></tr>))}</tbody></table></div>
          </>
        )}

        {activeTab === "users" && (
          <div className="table-container"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Doctor</th></tr></thead>
          <tbody>{users.map(u => (<tr key={u._id}><td>{u.fullName}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.type === "admin" ? "👑 Admin" : "👤 Patient"}</td><td>{u.isdoctor ? "✓ Doctor" : "Patient"}</td></tr>))}</tbody></table></div>
        )}

        {activeTab === "appointments" && (
          <div className="table-container"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>{appointments.map(a => (<tr key={a._id}><td>{a.userInfo?.fullName}</td><td>Dr. {a.doctorInfo?.fullName}</td><td>{new Date(a.date).toLocaleString()}</td><td><span className={`badge badge-${a.status === "approved" ? "success" : "warning"}`}>{a.status}</span></td></tr>))}</tbody></table></div>
        )}

        <footer className="footer">© 2024 MediCareBook</footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
