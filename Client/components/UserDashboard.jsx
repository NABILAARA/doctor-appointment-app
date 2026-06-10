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
      if (!token) { 
        navigate("/login"); 
        return; 
      }
      try {
        console.log("=== FETCHING DATA ===");
        
        // Get user data
        const userRes = await axios.get("http://localhost:8000/api/user/getuserdata", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (userRes.data.success) {
          console.log("User loaded:", userRes.data.data.fullName);
          setUser(userRes.data.data);
        }
        
        // GET DOCTORS - INI YANG PENTING
        const doctorsRes = await axios.get("http://localhost:8000/api/user/getalldoctors", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        console.log("Doctors API response:", doctorsRes.data);
        
        if (doctorsRes.data.success) {
          console.log("Setting doctors count:", doctorsRes.data.data.length);
          setDoctors(doctorsRes.data.data);
        } else {
          console.log("Doctors API failed:", doctorsRes.data.message);
        }
        
        // Get appointments
        const aptRes = await axios.get("http://localhost:8000/api/user/getuserappointments", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (aptRes.data.success) setAppointments(aptRes.data.data);
        
        // Get documents
        const docsRes = await axios.get("http://localhost:8000/api/user/getdocs", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (docsRes.data.success) setDocuments(docsRes.data.data || []);
        
        // Get notifications
        const notifRes = await axios.get("http://localhost:8000/api/user/getnotifications", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (notifRes.data.success) setNotifications(notifRes.data.data);
        
      } catch (err) { 
        console.error("Fetch error:", err); 
      }
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => { 
    localStorage.clear(); 
    navigate("/login"); 
  };

  const handleBook = (doctor) => { 
    setSelectedDoctor(doctor); 
    setShowBookingModal(true); 
  };
  
  const confirmBooking = async () => {
    if (!bookingDate) { 
      alert("Please select date and time"); 
      return; 
    }
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:8000/api/user/bookappointment", {
        userId: user._id, 
        doctorId: selectedDoctor._id, 
        userInfo: user, 
        doctorInfo: selectedDoctor, 
        date: bookingDate, 
        status: "pending"
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        alert("✅ Appointment booked!");
        setShowBookingModal(false);
        setBookingDate("");
        // Refresh appointments
        const aptRes = await axios.get("http://localhost:8000/api/user/getuserappointments", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (aptRes.data.success) setAppointments(aptRes.data.data);
      } else { 
        alert(res.data.message); 
      }
    } catch (err) { 
      alert("Booking failed"); 
    }
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
    } catch (err) { 
      alert("Cancel failed"); 
    }
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
        setDoctorForm({ 
          fullName: "", email: "", phone: "", address: "", 
          specialization: "", experience: "", fees: "", timings: "09:00 - 17:00" 
        });
      } else { 
        alert(res.data.message); 
      }
    } catch (err) { 
      alert("Apply failed"); 
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { 
      setMessage("Select a file"); 
      return; 
    }
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
        
        // Refresh documents
        const docsRes = await axios.get("http://localhost:8000/api/user/getdocs", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (docsRes.data.success) setDocuments(docsRes.data.data);
        
        setTimeout(() => setMessage(""), 3000);
      } else { 
        setMessage("Upload failed"); 
      }
    } catch (err) { 
      setMessage("Upload failed"); 
    }
    setUploading(false);
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8000/api/user/deletedocument/${docId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setDocuments(documents.filter(d => d._id !== docId));
      alert("✅ Document deleted");
    } catch (err) { 
      alert("Delete failed"); 
    }
  };

  const markNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8000/api/user/markallread", {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications({ 
        notification: [], 
        seennotification: [...notifications.seennotification, ...notifications.notification] 
      });
      alert("✅ All notifications marked as read");
    } catch (err) { 
      console.error(err); 
    }
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

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">🏥 MediCareBook</div>
        <ul className="sidebar-menu">
          <li><a href="#" className={activeTab === "doctors" ? "active" : ""} onClick={() => setActiveTab("doctors")}>🏠 Doctors</a></li>
          <li><a href="#" className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>📅 My Appointments</a></li>
          <li><a href="#" className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>📄 Documents</a></li>
          <li><a href="#" className={activeTab === "apply" ? "active" : ""} onClick={() => setActiveTab("apply")}>👨‍⚕️ Become a Doctor</a></li>
          <li><a href="#" className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>🔔 Notifications ({notifications.notification?.length || 0})</a></li>
          <li><hr style={{ margin: "15px 0" }} /></li>
          <li><a href="#" onClick={handleLogout}>🚪 Logout</a></li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="header-card">
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "5px" }}>Hello, {user?.fullName?.split(' ')[0] || "User"}! 👋</h1>
            <p style={{ color: "#64748b" }}>Manage your health appointments easily</p>
          </div>
          <div className="avatar">{user?.fullName?.charAt(0) || "U"}</div>
        </div>

        {/* STATS CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-value">{doctors.length}</div>
            <div className="stat-label">Available Doctors</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{documents.length}</div>
            <div className="stat-label">My Documents</div>
          </div>
        </div>

        {/* DOCTORS TAB */}
        {activeTab === "doctors" && (
          <>
            <h2 style={{ marginBottom: "20px" }}>👨‍⚕️ Available Doctors</h2>
            {doctors.length === 0 ? (
              <div className="stat-card" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>👨‍⚕️</div>
                <h3>No Doctors Available</h3>
                <p style={{ color: "#64748b" }}>Please check back later for available doctors.</p>
              </div>
            ) : (
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
                      <div className="doctor-info"><span>📍 Address</span><span>{doc.address || "-"}</span></div>
                      <button className="btn-primary" style={{ width: "100%", marginTop: "15px" }} onClick={() => handleBook(doc)}>
                        📅 Book Appointment
                      </button>
                      <a href={`https://wa.me/${doc.phone?.replace(/\D/g, '')}`} target="_blank" className="whatsapp-btn" rel="noreferrer">
                        💬 Chat via WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === "appointments" && (
          <>
            <h2 style={{ marginBottom: "20px" }}>📅 My Appointments</h2>
            {appointments.length === 0 ? (
              <div className="stat-card" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📅</div>
                <h3>No Appointments Yet</h3>
                <p style={{ color: "#64748b" }}>Book your first appointment with a doctor above.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Doctor</th><th>Specialization</th><th>Date & Time</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td><strong>Dr. {apt.doctorInfo?.fullName}</strong></td>
                        <td>{apt.doctorInfo?.specialization}</td>
                        <td>{new Date(apt.date).toLocaleString()}</td>
                        <td>{getStatusBadge(apt.status)}</td
                                                <td>
                          {apt.status === "pending" && (
                            <button className="btn-danger" onClick={() => cancelAppointment(apt._id)}>Cancel</button>
                          )}
                          {apt.status === "approved" && <span style={{ color: "#059669" }}>✓ Confirmed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <>
            <div className="form-container" style={{ maxWidth: "500px", marginBottom: "20px" }}>
              <h3>📤 Upload New Document</h3>
              {message && <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-error"}`}>{message}</div>}
              <div className="form-group">
                <label>Select File (PDF, JPG, PNG) - Max 5MB</label>
                <input id="fileInput" type="file" accept=".pdf,.jpg,.png" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </div>
              <button className="btn-primary" onClick={handleUpload} disabled={uploading} style={{ width: "100%" }}>
                {uploading ? "Uploading..." : "📤 Upload Document"}
              </button>
            </div>
            
            <h2>📋 My Documents ({documents.length})</h2>
            {documents.length === 0 ? (
              <div className="stat-card" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📄</div>
                <h3>No Documents Yet</h3>
                <p style={{ color: "#64748b" }}>Upload your medical records, prescriptions, or test results.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc._id}>
                        <td><strong>{doc.name}</strong></td>
                        <td>{formatFileSize(doc.size)}</td>
                        <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-danger" onClick={() => handleDeleteDoc(doc._id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* APPLY DOCTOR TAB */}
        {activeTab === "apply" && (
          <div className="form-container" style={{ maxWidth: "700px" }}>
            <h2>👨‍⚕️ Apply as Doctor</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Fill out the form below to become a verified doctor on our platform.</p>
            <div className="form-group"><label>Full Name</label><input placeholder="Dr. John Doe" value={doctorForm.fullName} onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })} /></div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="doctor@example.com" value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} /></div>
            <div className="form-group"><label>Phone</label><input placeholder="08123456789" value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} /></div>
            <div className="form-group"><label>Address</label><input placeholder="Clinic/Hospital Address" value={doctorForm.address} onChange={(e) => setDoctorForm({ ...doctorForm, address: e.target.value })} /></div>
            <div className="form-group"><label>Specialization</label><input placeholder="Cardiologist, Dermatologist, etc" value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} /></div>
            <div className="form-group"><label>Experience (years)</label><input type="number" placeholder="5" value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })} /></div>
            <div className="form-group"><label>Consultation Fee (Rp)</label><input type="number" placeholder="200000" value={doctorForm.fees} onChange={(e) => setDoctorForm({ ...doctorForm, fees: e.target.value })} /></div>
            <div className="form-group"><label>Practice Hours</label><input placeholder="09:00 - 17:00" value={doctorForm.timings} onChange={(e) => setDoctorForm({ ...doctorForm, timings: e.target.value })} /></div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleApplyDoctor}>📝 Submit Application</button>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>🔔 Notifications</h2>
              <button className="btn-primary" onClick={markNotificationsRead}>Mark All as Read</button>
            </div>
            
            <h3 style={{ marginBottom: "10px" }}>📬 New ({notifications.notification?.length || 0})</h3>
            {notifications.notification?.length === 0 ? (
              <div className="stat-card" style={{ textAlign: "center", padding: "20px" }}>
                <p style={{ color: "#64748b" }}>No new notifications</p>
              </div>
            ) : (
              notifications.notification?.map((n, i) => (
                <div key={i} style={{ background: "#fef3c7", padding: "15px", borderRadius: "12px", marginBottom: "10px", borderLeft: "4px solid #f59e0b" }}>
                  <p style={{ margin: 0 }}>{n.message}</p>
                  <small style={{ color: "#64748b" }}>New</small>
                </div>
              ))
            )}
            
            <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>✅ Read ({notifications.seennotification?.length || 0})</h3>
            {notifications.seennotification?.length === 0 ? (
              <div className="stat-card" style={{ textAlign: "center", padding: "20px" }}>
                <p style={{ color: "#64748b" }}>No read notifications</p>
              </div>
            ) : (
              notifications.seennotification?.map((n, i) => (
                <div key={i} style={{ background: "#f1f5f9", padding: "15px", borderRadius: "12px", marginBottom: "10px" }}>
                  <p style={{ margin: 0 }}>{n.message}</p>
                  <small style={{ color: "#64748b" }}>Read</small>
                </div>
              ))
            )}
          </>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <p>© 2024 MediCareBook. All rights reserved. | Your Health, Our Priority</p>
        </footer>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Book Appointment</h3>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Doctor:</strong> Dr. {selectedDoctor.fullName}</p>
              <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
              <p><strong>Fee:</strong> Rp {selectedDoctor.fees?.toLocaleString()}</p>
              <div className="form-group" style={{ marginTop: "15px" }}>
                <label>Select Date & Time</label>
                <input type="datetime-local" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowBookingModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;