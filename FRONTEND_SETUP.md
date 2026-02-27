# Frontend Setup Guide - React + Vite + Tailwind CSS

## Step 1: Delete Old Frontend (if exists)
```bash
# Make sure you're in the project root directory
# Delete the old frontend folder
rmdir /s /q frontend
```

## Step 2: Create New React + Vite Project
```bash
# Create new Vite project with React
npm create vite@latest frontend -- --template react

# Navigate to frontend folder
cd frontend

# Install dependencies
npm install
```

## Step 3: Install Tailwind CSS
```bash
# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p
```

## Step 4: Configure Tailwind CSS

### Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        }
      }
    },
  },
  plugins: [],
}
```

### Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## Step 5: Install Additional Dependencies

```bash
# Install React Router for navigation
npm install react-router-dom

# Install Axios for API calls
npm install axios

# Install Lucide React for icons
npm install lucide-react

# Install Google OAuth (if needed)
npm install @react-oauth/google
```

## Step 6: Create API Utility

Create `src/utils/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Step 7: Update `src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<h1 className="text-4xl font-bold text-center mt-20">Welcome to Future Milestone</h1>} />
          {/* Add more routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## Step 8: Update `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

## Step 9: Start Development Server

```bash
# Make sure you're in the frontend folder
npm run dev
```

Your frontend will be available at: **http://localhost:5173**

## Step 10: Test Backend Connection

Create `src/components/TestConnection.jsx`:
```javascript
import { useState } from 'react';
import api from '../utils/api';

function TestConnection() {
  const [status, setStatus] = useState('');

  const testBackend = async () => {
    try {
      const response = await api.get('/health');
      setStatus(`✅ Backend Connected: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setStatus(`❌ Backend Error: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <button 
        onClick={testBackend}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Test Backend Connection
      </button>
      {status && <p className="mt-4 text-lg">{status}</p>}
    </div>
  );
}

export default TestConnection;
```

## 📦 Complete Package.json Dependencies

Your `package.json` should include:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0",
    "@react-oauth/google": "^0.12.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

## 🎨 Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── layout/
│   ├── pages/
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## ✅ Checklist

- [ ] Delete old frontend folder
- [ ] Create new Vite + React project
- [ ] Install Tailwind CSS
- [ ] Configure Tailwind
- [ ] Install additional dependencies
- [ ] Create API utility
- [ ] Update App.jsx
- [ ] Configure Vite proxy
- [ ] Test backend connection
- [ ] Start building components

## 🚀 Quick Start Commands (All in One)

```bash
# From project root
rmdir /s /q frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios lucide-react @react-oauth/google
npm run dev
```

## 🔗 Backend Connection

Your backend is running at: **http://localhost:5000**
Your frontend will run at: **http://localhost:5173**

API calls will be made to: **http://localhost:5000/api**

---

**Ready to build! 🎉**
