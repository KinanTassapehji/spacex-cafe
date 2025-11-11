# SpaceX Gaming Cafe - Deployment Guide

## Project Structure
```
SpaceX/
├── client/          # React frontend application
├── server/          # Node.js backend API
└── DEPLOYMENT.md    # This file
```

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

---

## Option 1: Export for Production Deployment

### Step 1: Build the Client
```bash
cd client
npm install
npm run build
```
This creates a `build` folder with optimized production files.

### Step 2: Prepare the Server
```bash
cd ../server
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sales_management
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=production
```

### Step 4: Update Server to Serve Client Build
The server needs to serve the React build files. Add this to `server/index.js`:
```javascript
const path = require('path');

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
```

### Step 5: Create Production Start Script
Add to `server/package.json`:
```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
}
```

---

## Option 2: Export as Zip/Archive

### Windows PowerShell:
```powershell
# Navigate to parent directory
cd ..

# Create zip file (excluding node_modules)
Compress-Archive -Path SpaceX\* -DestinationPath spacex-gaming-cafe.zip -Force
```

### Manual Method:
1. Delete all `node_modules` folders in both client and server
2. Delete `client/build` folder if exists
3. Right-click the `SpaceX` folder → Send to → Compressed (zipped) folder

---

## Option 3: Deploy to Cloud Platforms

### Deploy to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
cd SpaceX
heroku create spacex-gaming-cafe
```

4. **Add MongoDB Atlas**
```bash
heroku addons:create mongolab:sandbox
```

5. **Configure Build**
Create `Procfile` in root:
```
web: cd server && npm start
```

6. **Deploy**
```bash
git init
git add .
git commit -m "Initial deployment"
git push heroku master
```

### Deploy to Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
cd client
npm install -g vercel
vercel
```

**Backend (Railway):**
1. Go to railway.app
2. Create new project
3. Connect GitHub repo or deploy from CLI
4. Add MongoDB plugin
5. Set environment variables

---

## Option 4: Docker Deployment

### Create Dockerfile for Client
`client/Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create Dockerfile for Server
`server/Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

### Create docker-compose.yml
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/sales_management
      - JWT_SECRET=your_secret_here
    depends_on:
      - mongodb

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  mongodb_data:
```

**Run with Docker:**
```bash
docker-compose up -d
```

---

## Option 5: Share via GitHub

```bash
cd SpaceX
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/spacex-gaming-cafe.git
git push -u origin master
```

Create `.gitignore`:
```
node_modules/
.env
build/
*.log
.DS_Store
```

---

## Post-Deployment Checklist

- [ ] Update MongoDB connection string
- [ ] Set secure JWT_SECRET
- [ ] Update API_BASE URL in client/src/App.js
- [ ] Enable CORS for production domain
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure MongoDB indexes for performance
- [ ] Set up backup strategy for database
- [ ] Test all features in production
- [ ] Monitor logs and errors

---

## Quick Start After Export

**For someone receiving your project:**

1. **Install dependencies:**
```bash
cd client && npm install
cd ../server && npm install
```

2. **Start MongoDB:**
```bash
mongod
```

3. **Start Server:**
```bash
cd server
npm start
```

4. **Start Client:**
```bash
cd client
npm start
```

5. **Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Environment Variables Reference

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sales_management
JWT_SECRET=your_secure_random_string_here
NODE_ENV=development
```

### Client
Update `API_BASE` in `src/App.js`:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

## Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check connection string format
- Verify network access (for cloud MongoDB)

**CORS Errors:**
- Update CORS settings in server/index.js
- Add production domain to allowed origins

**Build Errors:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are listed in package.json

---

## Support

For issues or questions, refer to:
- React Documentation: https://reactjs.org/
- Express Documentation: https://expressjs.com/
- MongoDB Documentation: https://docs.mongodb.com/

---

**Created:** 2025
**Version:** 1.0.0