# 🎓 UNN Attendance System

A **full-stack QR-code based attendance management system** built for the **University of Nigeria, Nsukka (UNN)**.  
The system enables lecturers to generate attendance sessions using QR codes, students to mark attendance securely, and administrators to manage courses and generate attendance reports.

---

## ✨ Features

### 🔐 Authentication & Roles
- JWT-based authentication
- Role-based access control:
  - **Admin**
  - **Lecturer**
  - **Student**

---

### 👨‍🏫 Lecturer
- View assigned courses
- Create attendance sessions
- Generate **QR codes** for attendance
- End sessions manually
- View and export attendance reports (CSV / PDF)

---

### 👨‍🎓 Student
- Register & login
- Scan QR code or submit attendance code
- Mark attendance securely
- View personal attendance history (Present / Absent)

---

### 🧑‍💼 Admin
- Create and manage courses
- Assign lecturers to courses
- View all attendance records
- Filter by date, status, course
- Export attendance reports as **CSV** or **PDF**

---

## 🛠 Tech Stack

### Frontend
- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- JWT authentication (localStorage)
- File downloads via authenticated fetch

### Backend
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- JWT authentication
- Role-based middleware
- PDF & CSV report generation

---

## 📁 Project Structure

```text
Attendance-System/
├── attendance-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── server.js
│   └── package.json
│
├── attendance-frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── lecturer/
│   │   ├── student/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── README.md

