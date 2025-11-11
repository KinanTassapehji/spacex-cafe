# 🚀 SpaceX Gaming Cafe - Management System

A full-stack web application for managing gaming cafe operations including multi-device sessions, inventory, sales tracking, and comprehensive reporting.

[![Production Ready](https://img.shields.io/badge/production-ready-brightgreen)]()
[![Deploy to Render](https://img.shields.io/badge/deploy-render.com-blue)]()
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)]()

---

## ✨ Features

### 🎮 Session Management
- Multi-device support (PC, PS4, PS5, Bilardo)
- Real-time session monitoring
- Automatic time tracking and billing
- Flexible hourly rates

### 📦 Inventory Management
- Stock tracking for snacks and drinks
- Automatic stock deduction on sales
- Low-stock alerts
- Income/Output tracking

### 💰 POS System
- Quick snack/drink sales during sessions
- Automatic billing calculation
- Sale summaries with itemized receipts

### 📊 Reports & Analytics
- Daily, weekly, and monthly sales reports
- Revenue tracking by category
- Session history and analytics
- Admin-only access controls

### 👥 User Management
- Role-based access (Admin/Staff)
- Secure authentication with JWT
- User registration and login

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **Deployment**: Render.com (recommended)

---

## 🚀 Quick Start

### Option 1: Deploy to Production (Recommended)

**⏱️ Time: 15-20 minutes | 💰 Cost: $0 (Free)**

1. **Read the deployment guide**:
   ```
   📖 DEPLOYMENT_SUMMARY.md - Start here!
   📖 RENDER_DEPLOYMENT.md - Detailed Render.com guide
   ```

2. **Quick Deploy**:
   - Set up MongoDB Atlas (free)
   - Push to GitHub
   - Deploy to Render.com
   - Done! 🎉

### Option 2: Run Locally

**Prerequisites**: MongoDB, Node.js 14+

```powershell
# Install dependencies
cd client
npm install
cd ../server
npm install

# Start MongoDB (new terminal)
mongod

# Start server (new terminal)
cd server
npm start

# Start client (new terminal)
cd client
npm start
```

**Access**: http://localhost:3000

---

## 📁 Project Structure

```
SpaceX/
├── client/                    # React frontend
│   ├── src/
│   │   ├── App.js            # Main application
│   │   └── index.js          # Entry point
│   ├── public/
│   └── build/                # Production build ✅
├── server/                    # Node.js backend
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── index.js              # Server entry
│   └── .env.example          # Environment template
├── render.yaml               # Render deployment config
├── DEPLOYMENT_SUMMARY.md     # 📖 START HERE
├── RENDER_DEPLOYMENT.md      # Render.com guide
├── DEPLOYMENT_OPTIONS.md     # All deployment options
└── PRODUCTION_CHECKLIST.md   # Testing checklist
```

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **DEPLOYMENT_SUMMARY.md** | 🎯 **START HERE** - Overview and quick deploy |
| **RENDER_DEPLOYMENT.md** | Complete Render.com deployment guide |
| **DEPLOYMENT_OPTIONS.md** | Compare all hosting options |
| **PRODUCTION_CHECKLIST.md** | Post-deployment testing guide |
| **QUICK_START.md** | Quick reference for all tasks |
| **DEPLOYMENT.md** | Comprehensive deployment guide |

---

## 🎯 First Time Setup

After deployment:

1. Visit your app URL
2. Click **"Register"**
3. Create an admin account
4. Login and start managing!

**Default Features**:
- 6 PCs, 4 PS4/PS5 consoles, 1 Bilardo table
- Customizable hourly rates
- Real-time session monitoring
- Inventory management

---

## 🔐 Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sales_management
JWT_SECRET=your_secure_random_string_here
NODE_ENV=development
```

**Production**: Set these in your hosting platform (Render, Railway, etc.)

---

## 🌐 Deployment Options

| Platform | Cost | Setup Time | Guide |
|----------|------|------------|-------|
| **Render.com** ⭐ | Free | 15 min | `RENDER_DEPLOYMENT.md` |
| **Railway.app** | $5/mo free | 10 min | `DEPLOYMENT_OPTIONS.md` |
| **Fly.io** | Free tier | 20 min | `DEPLOYMENT_OPTIONS.md` |
| **Heroku** | Limited free | 15 min | `DEPLOYMENT_OPTIONS.md` |
| **Local** | Free | 5 min | See above |

---

## 🧪 Testing

Use the comprehensive testing checklist:

```
📋 PRODUCTION_CHECKLIST.md
```

Test all features:
- ✅ Authentication
- ✅ Session management
- ✅ Inventory operations
- ✅ Sales tracking
- ✅ Reports generation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

ISC License - See LICENSE file for details

---

## 🆘 Support

- **Deployment Issues**: Check `RENDER_DEPLOYMENT.md`
- **General Setup**: Check `DEPLOYMENT.md`
- **Quick Reference**: Check `QUICK_START.md`

---

## 🎉 Ready to Deploy?

```powershell
# Read the guide
cat DEPLOYMENT_SUMMARY.md

# Or just deploy!
.\deploy.ps1
```

**Your gaming cafe management system is production-ready! 🚀**

---

**Created with ❤️ for gaming cafe owners**
