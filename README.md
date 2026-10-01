# My Portfolio

A full-stack personal portfolio website built to showcase my work, skills, and services.

The project includes a public portfolio website, a contact form connected to a backend API, a PostgreSQL database, and a private admin dashboard for managing contact submissions.

## Features

- Responsive portfolio website
- About, services, projects, and skills sections
- Contact form
- Backend API for contact submissions
- PostgreSQL database
- Private admin login
- Admin dashboard
- View contact submissions
- Search and sort submissions
- Delete submissions
- CSV export
- Session-based authentication
- CSRF protection
- Login rate limiting
- Security headers

## Technologies

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- REST API

### Database

- PostgreSQL
- SQL

### Security

- bcrypt
- Express Session
- Helmet
- Express Rate Limit
- CSRF protection

## Project Structure

```text
my-portfolio/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── admin.js
│   └── admin.css
│
├── backend/
│   ├── server.js
│   └── database.js
│
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md