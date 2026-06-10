# 🏥 Book a Doctor App

A full-stack web application for booking doctor appointments built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

---

## 📋 Features

### 👤 Patient
- Register and login
- Browse approved doctors
- Book appointments
- Cancel appointments
- View appointment history
- Upload medical documents
- Apply to become a doctor
- Receive notifications

### 👑 Admin
- Login as admin
- Approve/reject doctor applications
- View all users
- View all appointments

---

## 🛠️ Technologies Used

| Category | Technologies |
|----------|--------------|
| Frontend | React.js, Vite, Axios, React Router DOM, Bootstrap, React Bootstrap |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT (JSON Web Token), Bcryptjs |
| File Upload | Multer |

---

## 🚀 How to Run the Project

### Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm (v8 or higher)
- Internet connection (for MongoDB Atlas)

### Step 1: Clone the Repository

git clone https://github.com/your-username/doctor-appointment-app.git
cd doctor-appointment-app

### Step 2: Install Backend Dependencies

cd Server
npm install

### Step 3: Configure Environment Variables

PORT=8000
MONGO_DB=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/doctorapp
JWT_KEY=your_secret_key

### Step 4: Run the Backend Server

nodemon server.js

### Step 5: Install Frontend Dependencies

cd Client
npm install

### Step 6: Run the Frontend Application

npm run dev




