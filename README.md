# Support Hub - AI-Powered Ticket Management System

A modern ticket management system with AI-powered analysis and automatic moderator assignment.

## 🚀 Features

- User authentication (signup/login) with role-based access
- AI-powered ticket analysis and moderator assignment
- Real-time ticket status updates
- Automated welcome emails for new users
- Role-based dashboards (Admin/Moderator/User)
- Smart ticket routing based on moderator skills
- Comprehensive ticket management

## 🛠️ Tech Stack

### Frontend
- React with Vite
- TailwindCSS + DaisyUI
- React Router Dom
- React Hot Toast
- React Markdown

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Inngest for Event Processing
- OpenAI for ticket analysis
- Nodemailer for emails

## 📝 API Documentation

### Authentication Endpoints

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "user" | "moderator",
  "skills": "string[]" // Required for moderator
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Ticket Endpoints

```http
POST /api/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "description": "string"
}
```

```http
GET /api/tickets
Authorization: Bearer {token}
```

```http
GET /api/tickets/:id
Authorization: Bearer {token}
```

```http
GET /api/tickets/user
Authorization: Bearer {token}
```

```http
GET /api/tickets/moderator
Authorization: Bearer {token}
```

```http
PATCH /api/tickets/:ticketId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "TODO" | "IN_PROGRESS" | "COMPLETED"
}
```

### Admin Endpoints

```http
GET /api/auth/users
Authorization: Bearer {token}
```

```http
POST /api/auth/update-user
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "string",
  "role": "user" | "moderator" | "admin",
  "skills": "string[]"
}
```

## 🔧 Environment Variables

### Backend (.env)
```plaintext
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key
```

### Frontend (.env)
```plaintext
VITE_SERVER_URL=http://localhost:3000/api
```

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/support-hub.git
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

3. Set up environment variables
- Create `.env` files in both frontend and backend directories
- Add the required environment variables

4. Start the development servers
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## 🔐 Role-Based Access

### User
- Create and track support tickets
- View ticket status and updates
- Communicate with moderators

### Moderator
- Handle assigned tickets
- Update ticket status
- Access AI-powered analysis

### Admin
- Manage all tickets
- Assign/reassign moderators
- User management
- Access analytics

## 🎨 UI Components

The project uses DaisyUI components with custom styling:
- Cards for ticket display
- Badges for status and priority
- Modals for confirmations
- Toast notifications
- Responsive navigation
- Custom forms

## 📦 Folder Structure

```plaintext
frontend/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── assets/
  │   └── main.jsx
  └── index.html

backend/
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  ├── utils/
  ├── inngest/
  └── index.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.