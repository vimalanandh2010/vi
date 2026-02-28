# Future Milestone - Project Overview

## Executive Summary

**Future Milestone** is a comprehensive, production-ready MERN stack job portal platform that connects job seekers with recruiters and employers.

### Purpose
- **For Job Seekers**: Find jobs, build profiles, learn skills, connect with employers
- **For Recruiters**: Complete ATS, candidate management, hiring tools
- **For Both**: Real-time communication, AI assistance, community engagement

### Key Features
- ✅ Dual Role System (Seekers & Recruiters)
- ✅ Real-time Communication (Socket.IO)
- ✅ AI Integration (Google Gemini)
- ✅ Video Interviews (Jitsi)
- ✅ Learning Platform
- ✅ Advanced ATS
- ✅ Multi-cloud Storage (Supabase → Firebase → Local)
- ✅ Google OAuth
- ✅ Responsive Design

### Current Deployment
- **Backend**: https://backend-portal-56ud.onrender.com
- **Frontend**: Ready for Vercel deployment
- **Database**: MongoDB Atlas
- **Status**: Production-ready

## Technology Stack

### Backend
- Node.js 16+
- Express.js 4.18.2
- MongoDB (Mongoose 9.1.4)
- Socket.IO 4.8.3
- JWT 9.0.3
- bcryptjs 3.0.3
- Passport 0.7.0
- Multer 2.0.2
- Nodemailer 7.0.12

### Frontend
- React 18.2.0
- Vite 5.0.0
- React Router 7.13.0
- Tailwind CSS 3.4.0
- Axios 1.13.5
- Socket.IO Client 4.8.3
- Framer Motion 12.33.0

### Cloud Services
- Supabase (Primary storage)
- Firebase (Fallback storage)
- Render (Backend hosting)
- Vercel (Frontend hosting - recommended)
- MongoDB Atlas (Database)

### AI & Video
- Google Gemini AI
- Jitsi React SDK
- Tesseract.js (OCR)

## Architecture Overview

```
User Browser
    ↓
Frontend (React + Vite) - Port 5173
    ↓
Backend (Node.js + Express) - Port 5000
    ↓
MongoDB Database - Port 27017
    ↓
External Services (Google OAuth, Gemini AI, Supabase, Firebase, Jitsi)
```

## Quick Links
- [Installation Guide](./02-INSTALLATION.md)
- [Deployment Guide](./03-DEPLOYMENT.md)
- [API Reference](./04-API-REFERENCE.md)
- [Database Schema](./05-DATABASE-SCHEMA.md)
- [Configuration](./06-CONFIGURATION.md)
- [Security](./07-SECURITY.md)
- [Troubleshooting](./08-TROUBLESHOOTING.md)
- [Testing](./09-TESTING.md)
- [Maintenance](./10-MAINTENANCE.md)

---
**Version**: 1.0.0  
**Last Updated**: February 28, 2026  
**Status**: Production Ready
