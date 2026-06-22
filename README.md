# Who's In?

### Find Teammates. Build Together.

Who's In? is a student-focused platform that helps users find teammates for hackathons, research projects, startups, open-source contributions, competitions, and college projects.

Students can create teams, discover opportunities, request to join teams, and connect with collaborators through shared contact information.

---

## Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Secure Password Hashing with bcrypt

### User Profiles

* Full Name
* College
* Branch
* Skills
* Bio
* GitHub Profile (Optional)
* LinkedIn Profile (Optional)
* Contact Information

### Team Management

* Create Teams
* Edit Teams
* Delete Teams
* Define Required Skills
* Set Maximum Team Size

### Team Discovery

* Browse Available Teams
* Search Teams
* Filter by Category

### Join Requests

* Send Join Requests
* Add Introduction Message
* View Applicant Profiles
* Accept or Reject Requests

### Contact Sharing

Users provide at least one contact method:

* Email
* LinkedIn
* Phone Number

Accepted members can connect outside the platform.

### Admin Panel

* View All Users
* View All Teams
* Edit Teams
* Delete Teams
* Suspend Users

### Email Notifications

* Join Request Submitted
* Join Request Accepted
* Join Request Rejected

---

## Tech Stack

### Frontend

* React.js

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose

### Email Service

* Nodemailer

---

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── utils/
│   └── server.js
│
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── context/
│   └── App.jsx
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd whos-in
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Who's In? <noreply@whosin.com>"

ADMIN_EMAIL=admin@whosin.com
ADMIN_PASSWORD=Admin@123
```

Start backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## User Flow

### Create Team

```text
Register/Login
      ↓
Create Team
      ↓
Publish Team
```

### Join Team

```text
Browse Teams
      ↓
View Team Details
      ↓
Submit Join Request
      ↓
Creator Reviews Request
      ↓
Accept / Reject
```

### Connect With Team

```text
Accepted
      ↓
View Team Members
      ↓
Access Contact Information
      ↓
Connect Externally
```

---

## Database Collections

### Users

Stores:

* User Profile
* Skills
* Contact Information
* Authentication Data

### Teams

Stores:

* Team Details
* Creator
* Members

### JoinRequests

Stores:

* Applicant
* Team
* Introduction Message
* Status

### Notifications

Stores:

* System Notifications
* Request Updates

---

## Future Roadmap

### Version 2

* Team Invitations
* In-App Notifications
* Real-Time Chat

### Version 3

* Task Management
* File Sharing
* Team Ratings
* Project Showcase Pages
* Mobile Application

---

## Goal

The goal of Who's In? is simple:

> **Create a team, find the right people, and start building together.**
