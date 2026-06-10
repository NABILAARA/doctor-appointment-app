import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState({ notification: [], seennotification: [] });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("doctors");
  const [message, setMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [doctorForm, setDoctorForm] = useState({ 
    fullName: "", email: "", phone: "", address: "", 
    specialization: "", experience: "", fees: "", timings: "09:00 - 17:00" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const userRes = await axios.get("http://localhost:8000/api/user/getuserdata", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (userRes.data.success) setUser(userRes.data.data);
        
        const doctorsRes = await axios.get("http://localhost:8000/api/user/getalldoctors", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (doctorsRes.data.success) setDoctors(doctorsRes.data.data);
        
        const aptRes = await axios.get("http://localhost:8000/api/user/getuserappointments", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (aptRes.data.success) setAppointments(aptRes.data.data);
        
        const docsRes = await axios.get("http://localhost:8000/api/user/getdocs", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (docsRes.data.success) setDocuments(docsRes.data.data || []);
        
        const notifRes = await axios.get("http://localhost:8000/api/user/getnotifications", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (notifRes.data.success) setNotifications(notifRes.data.data);
        
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const handleBook = (doctor) => { setSelectedDoctor(doctor); setShowBookingModal(true); };
  
  const confirmBooking = async () => {
    if (!bookingDate) { alert("Please select date and time"); return; }
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:8000/api/user/bookappointment", {
        userId: user._id, doctorId: selectedDoctor._id, 
        userInfo: user, doctorInfo: selectedDoctor, date: bookingDate, status: "pending"
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        alert("✅ Appointment booked!");
        setShowBookingModal(false);
        setBookingDate("");
        const aptRes = await axios.get("http://localhost:8000/api/user/getuserappointments", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (aptRes.data.success) setAppointments(aptRes.data.data);
      } else { alert(res.data.message); }
    } catch (err) { alert("Booking failed"); }
  };

  const cancelAppointment = async (aptId) => {
    if (!window.confirm("Cancel this appointment?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8000/api/user/cancelappointment/${aptId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAppointments(appointments.filter(a => a._id !== aptId));
      alert("✅ Appointment cancelled");
    } catch (err) { alert("Cancel failed"); }
  };

  const handleApplyDoctor = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:8000/api/user/applydoctor", 
        { doctor: doctorForm }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) { 
        alert("✅ Application submitted! Waiting for admin approval."); 
        setDoctorForm({ fullName: "", email: "", phone: "", address: "", specialization: "", experience: "", fees: "", timings: "09:00 - 17:00" });
      } else { alert(res.data.message); }
    } catch (err) { alert("Apply failed"); }
  };

  const handleUpload = async () => {
    if (!selectedFile) { setMessage("Select a file"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("document", selectedFile);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:8000/api/user/uploaddocument", formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessage("✅ Uploaded!");
        setSelectedFile(null);
        document.getElementById("fileInput").value = "";
        // Refresh documents list
        const docsRes = await axios.get("http://localhost:8000/api/user/getdocs", 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (docsRes.data.success) setDocuments(docsRes.data.data);
        setTimeout(() => setMessage(""), 3000);
      } else { setMessage("Upload failed"); }
    } catch (err) { setMessage("Upload failed"); }
    setUploading(false);
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8000/api/user/deletedocument/${docId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments(documents.filter(d => d._id !== docId));
      alert("✅ Document deleted");
    } catch (err) { alert("Delete failed"); }
  };

  const markNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8000/api/user/markallread", {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications({ notification: [], seennotification: [...notifications.seennotification, ...notifications.notification] });
      alert("✅ All notifications marked as read");
    } catch (err) { console.error(err); }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB";
    return (bytes/(1024*1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = (status) => {
    if (status === "approved") return <span className="badge badge-success">✓ Approved</span>;
    if (status === "pending") return <span className="badge badge-warning">⏳ Pending</span>;
    return <span className="badge badge-warning">{status}</span>;
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">🏥 MediCareBook</div>
        <ul className="sidebar-menu">
          <li><a href="#" className={activeTab === "doctors" ? "active" : ""} onClick={() => setActiveTab("doctors")}>🏠 Doctors</a></li>
          <li><a href="#" className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>📅 My Appointments</a></li>
          <li><a href="#" className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>📄 Documents</a></li>
          <li><a href="#" className={activeTab === "apply" ? "active" : ""} onClick={() => setActiveTab("apply")}>👨‍⚕️ Become a Doctor</a></li>
          <li><a href="#" className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>🔔 Notifications</a></li>
          <li><hr style={{ margin: "15px 0", borderColor: "#e2e8f0" }} /></li>
          <li><a href="#" onClick={handleLogout}>🚪 Logout</a></li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header-card">
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "5px" }}>Hello, {user?.fullName?.split(' ')[0] || "User"}! 👋</h1>
            <p style={{ color: "#64748b" }}>Manage your health appointments easily</p>
          </div>
          <div className="avatar">{user?.fullName?.charAt(0) || "U"}</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">👨‍⚕️</div><div className="stat-value">{doctors.length}</div><div className="stat-label">Available Doctors</div></div>
          <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-value">{appointments.length}</div><div className="stat-label">Total Appointments</div></div>
          <div className="stat-card"><div className="stat-icon">📄</div><div className="stat-value">{documents.length}</div><div className="stat-label">My Documents</div></div>
        </div>

        {activeTab === "doctors" && (
          <>
            <h2>👨‍⚕️ Available Doctors</h2>
            <div className="doctors-grid">
              {doctors.map(doc => (
                <div className="doctor-card" key={doc._id}>
                  <div className="doctor-card-header">
                    <div className="doctor-avatar">👨‍⚕️</div>
                    <div className="doctor-name">Dr. {doc.fullName}</div>
                    <div className="doctor-specialty">{doc.specialization}</div>
                  </div>
                  <div className="doctor-card-body">
                    <div className="doctor-info"><span>💰 Fee</span><span>Rp {doc.fees?.toLocaleString()}</span></div>
                    <div className="doctor-info"><span>⭐ Experience</span><span>{doc.experience} years</span></div>
                    <div className="doctor-info"><span>📞 Phone</span><span>{doc.phone}</span></div>
                    <button className="btn-primary" style={{ width: "100%", marginTop: "15px" }} onClick={() => handleBook(doc)}>📅 Book Appointment</button>
                    <a href={`https://wa.me/${doc.phone?.replace(/\D/g, '')}`} target="_blank" className="whatsapp-btn" rel="noreferrer">💬 WhatsApp</a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "appointments" && (
          <>
            <h2>📅 My Appointments</h2>
            {appointments.length === 0 ? (
              <div className="stat-card">No appointments yet</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>Dr. {apt.doctorInfo?.fullName}</td>
                        <td>{new Date(apt.date).toLocaleString()}</td>
                        <td>{getStatusBadge(apt.status)}</td>
                        <td>
                          {apt.status === "pending" && (
                            <button className="btn-danger" onClick={() => cancelAppointment(apt._id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "documents" && (
          <>
            <div className="form-container" style={{ marginBottom: "20px" }}>
              <h3>📤 Upload Document</h3>
              {message && <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-error"}`}>{message}</div>}
              <input type="file" id="fileInput" accept=".pdf,.jpg,.png" onChange={(e) => setSelectedFile(e.target.files[0])} />
              <button className="btn-primary" style={{ marginTop: "10px" }} onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
            </div>
            <h3>📋 My Documents ({documents.length})</h3>
            {documents.length === 0 ? (
              <div className="stat-card">No documents yet</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Size</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc._id}>
                        <td>{doc.name}</td>
                        <td>{formatFileSize(doc.size)}</td>
                        <td><button className="btn-danger" onClick={() => handleDeleteDoc(doc._id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "apply" && (
          <div className="form-container" style={{ maxWidth: "600px" }}>
            <h2>Apply as Doctor</h2>
            <div className="form-group"><label>Full Name</label><input value={doctorForm.fullName} onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })} /></div>
            <div className="form-group"><label>Email</label><input value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} /></div>
            <div className="form-group"><label>Phone</label><input value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} /></div>
            <div className="form-group"><label>Address</label><input value={doctorForm.address} onChange={(e) => setDoctorForm({ ...doctorForm, address: e.target.value })} /></div>
            <div className="form-group"><label>Specialization</label><input value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} /></div>
            <div className="form-group"><label>Experience (years)</label><input type="number" value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })} /></div>
            <div className="form-group"><label>Fee (Rp)</label><input type="number" value={doctorForm.fees} onChange={(e) => setDoctorForm({ ...doctorForm, fees: e.target.value })} /></div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleApplyDoctor}>Submit Application</button>
          </div>
        )}

        {activeTab === "notifications" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>🔔 Notifications</h2>
              <button className="btn-primary" onClick={markNotificationsRead}>Mark All Read</button>
            </div>
            <h3>New ({notifications.notification?.length || 0})</h3>
            {notifications.notification?.length === 0 ? (
              <div className="stat-card">No new notifications</div>
            ) : (
              notifications.notification?.map((n, i) => <div key={i} className="alert alert-warning">{n.message}</div>)
            )}
            <h3>Read ({notifications.seennotification?.length || 0})</h3>
            {notifications.seennotification?.length === 0 ? (
              <div className="stat-card">No read notifications</div>
            ) : (
              notifications.seennotification?.map((n, i) => <div key={i} className="alert">{n.message}</div>)
            )}
          </>
        )}

        <footer className="footer">© 2024 MediCareBook</footer>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Appointment</h3>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Dr. {selectedDoctor.fullName}</strong> - {selectedDoctor.specialization}</p>
              <p>Fee: Rp {selectedDoctor.fees?.toLocaleString()}</p>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" onChange={(e) => setBookingDate(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowBookingModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmBooking}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
