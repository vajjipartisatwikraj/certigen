# CertiGen - Certificate Generator

> A full-stack MERN application for creating and generating personalized certificates with custom templates, bulk email delivery, and interactive design tools.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [UI Design Features](#-ui-design-features)
- [Usage Guide](#-usage-guide)
- [Gmail Setup for Bulk Email](#-gmail-setup-for-bulk-email)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

### Core Features
- 📤 **Template Upload** - Upload custom A4 landscape certificate templates with validation
- 🎨 **Interactive Editor** - Drag-and-drop text field positioning with real-time coordinate tracking
- 👁️ **Live Preview** - Real-time certificate preview with dynamic rendering
- 📄 **PDF Generation** - High-quality PDF certificates with precise text placement
- 🔤 **Smart Font Sizing** - Automatic font size adjustment to fit text within boundaries
- 💾 **Template Management** - Save, edit, and delete certificate templates

### Advanced Features
- 📧 **Bulk Email Delivery** - Send certificates to multiple recipients via Gmail
- 📊 **CSV Import** - Process multiple certificates from CSV files
- 📈 **Progress Tracking** - Real-time progress updates for bulk operations
- 🎯 **Multiple Fields** - Support for name, date, course, and custom text fields
- 🎨 **Customizable Design** - Font family, size, weight, alignment, and color options

### UI/UX Features
- ✨ **Modern GenZ Aesthetic** - Vibrant gradients, glassmorphism, and playful micro-interactions
- 🌈 **Bold Color Palette** - Electric blues, neon purples, coral pinks, and mint greens
- 🎭 **Dark Mode** - High contrast dark theme with animated backgrounds
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🎯 **Interactive Dashboard** - Real-time statistics and activity tracking
- 🔔 **Toast Notifications** - Beautiful success/error notifications
- 💫 **Smooth Animations** - Floating elements, hover effects, and transitions

---

## 🎨 Design System

### Color Palette

The CertiGen UI features a vibrant, contemporary color scheme designed for the GenZ audience:

```css
/* Primary Colors */
--electric-blue: #00D4FF;    /* Primary actions, links */
--neon-purple: #A855F7;      /* Secondary elements */
--coral-pink: #FF6B9D;       /* Errors, deletions */
--mint-green: #5EEAD4;       /* Success states */
--cyber-yellow: #FCD34D;     /* Warnings */

/* Dark Mode */
--dark-bg: #0A0E27;          /* Main background */
--dark-surface: #1A1F3A;     /* Card surfaces */
--dark-elevated: #252B48;    /* Elevated components */
```

### Typography

- **Display Font**: Inter (900 weight for hero titles)
- **Body Font**: Inter (400-600 weights)
- **Monospace**: Fira Code (for code snippets)

### Visual Effects

1. **Glassmorphism** - Frosted glass effect on cards and modals
2. **Gradient Overlays** - Smooth color transitions on buttons and headings
3. **Soft Shadows** - Multi-layer shadows with glow effects
4. **Floating Animations** - Gentle up-and-down motion for decorative elements
5. **Hover Transforms** - Scale and translate effects on interactive elements

---

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Server runtime
- **Express.js** - RESTful API framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **PDFKit** - PDF generation engine
- **Nodemailer** - Email delivery
- **Multer** - File upload handling
- **Sharp** - Image processing and validation
- **Canvas** - Server-side font calculations

### Frontend
- **React.js** (v18+) - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React-Draggable** - Interactive drag-and-drop
- **HTML5 Canvas** - Client-side rendering

---

## 📁 Project Structure

```
certigen/
├── backend/
│   ├── config/
│   │   └── multer.js              # File upload configuration
│   ├── models/
│   │   ├── Template.js            # Template schema
│   │   └── Certificate.js         # Certificate schema
│   ├── routes/
│   │   ├── templateRoutes.js      # Template API endpoints
│   │   └── certificateRoutes.js   # Certificate API endpoints
│   ├── services/
│   │   ├── pdfService.js          # PDF generation service
│   │   └── emailService.js        # Email delivery service
│   ├── uploads/                   # Uploaded templates (auto-created)
│   ├── certificates/              # Generated PDFs (auto-created)
│   ├── .env.example              # Environment variables template
│   ├── server.js                 # Express server
│   ├── test-email.js             # Email testing utility
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   └── ProgressBar.jsx
    │   │   ├── TemplateUploader/
    │   │   │   └── TemplateUploader.jsx
    │   │   ├── CanvasEditor/
    │   │   │   └── CanvasEditor.jsx
    │   │   ├── CertificateGenerator/
    │   │   │   └── CertificateGenerator.jsx
    │   │   └── BulkCertificateGenerator/
    │   │       └── BulkCertificateGenerator.jsx
    │   ├── pages/
    │   │   └── Home.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── templateService.js
    │   │   └── certificateService.js
    │   ├── utils/
    │   │   ├── canvasUtils.js
    │   │   └── validators.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    └── package.json
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB** v6 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** (optional, for version control)

### Verify Installation

```powershell
# Check Node.js version
node --version  # Should show v18.x.x or higher

# Check npm version
npm --version   # Should show 9.x.x or higher

# Check MongoDB
mongod --version
```

---

## 🚀 Installation

### Option 1: Automated Installation (Recommended)

```powershell
# From project root directory
.\install.ps1
```

### Option 2: Manual Installation

#### 1. Clone or Navigate to Project

```powershell
cd C:\Users\SATWIK\OneDrive\Desktop\certigen
```

#### 2. Install Backend Dependencies

```powershell
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```powershell
cd ..\frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

1. Create `.env` file in the `backend/` directory:

```powershell
cd backend
Copy-Item .env.example .env
```

2. Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/certigen

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173

# Gmail Configuration (for bulk email feature)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM_NAME=CertiGen
```

> **Important:** For bulk email functionality, you need to set up Gmail with an App Password. See the [Gmail Setup section](#-gmail-setup-for-bulk-email) below.

### Frontend Configuration

The frontend is pre-configured with Vite proxy settings in `vite.config.js`. No additional configuration needed.

---

## 🏃 Running the Application

### Step 1: Start MongoDB

```powershell
# If MongoDB is installed as a Windows service
Start-Service MongoDB

# OR run manually
mongod
```

### Step 2: Start Backend Server

Open a terminal and run:

```powershell
cd backend
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Step 3: Start Frontend Server

Open a **new terminal** and run:

```powershell
cd frontend
npm run dev
```

You should see:

```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Open Application

Open your browser and navigate to: **http://localhost:5173**

---

## 🎨 UI Design Features

CertiGen features a modern, GenZ-aesthetic interface designed for tech-savvy users aged 18-35. For complete design system documentation, see [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md).

### Visual Highlights

- **🌈 Vibrant Color Palette** - Electric blues, neon purples, coral pinks, mint greens
- **💎 Glassmorphism Effects** - Frosted glass cards with backdrop blur
- **✨ Gradient Overlays** - Smooth color transitions on interactive elements
- **🎯 Interactive Dashboard** - Real-time statistics with animated cards
- **💫 Micro-interactions** - Floating animations, hover effects, smooth transitions
- **📱 Fully Responsive** - Optimized for all screen sizes
- **🔔 Toast Notifications** - Beautiful success/error messages
- **🎭 Dark Mode** - High-contrast dark theme with animated backgrounds

### Key UI Components

- **Hero Header** - Large gradient titles with floating decorative shapes
- **Stat Cards** - Glassmorphism cards showing templates, certificates, emails
- **Template Gallery** - Grid layout with hover overlays and quick actions
- **Progress Tracker** - Animated progress bars with real-time updates
- **Modal Dialogs** - Backdrop blur with smooth enter/exit animations
- **Empty States** - Friendly illustrations and clear call-to-actions

### UI Documentation

For detailed information about the design system:
- 📘 **[UI Design System](UI_DESIGN_SYSTEM.md)** - Complete design tokens, components, and guidelines
- 🚀 **[UI Quick Start](UI_QUICKSTART.md)** - User guide for navigating the interface
- 🔧 **[UI Implementation](UI_IMPLEMENTATION.md)** - Technical implementation details

---

## 📖 Usage Guide

### 1. Upload a Certificate Template

1. Click **"➕ Create Template"** on the dashboard
2. Enter a template name (e.g., "Completion Certificate")
3. Upload an A4 landscape image:
   - Recommended dimensions: **1122×794 pixels**
   - Formats: PNG, JPG, JPEG
   - Max size: 5MB
   - Aspect ratio must be ~1.413 (A4 landscape)
4. Click **"Upload & Continue to Editor"**

### 2. Configure Text Fields

1. In the editor, click **"Add Text Field"** to create new placeholders
2. **Drag** text boxes to position them on the certificate
3. Select a text box to customize:
   - **Field Name** - Internal identifier (e.g., "recipientName")
   - **Position** - X and Y coordinates (auto-updated when dragging)
   - **Size** - Width and height percentages
   - **Font** - Family, size, weight
   - **Alignment** - Left, center, or right
   - **Color** - Text color picker
4. Click **"Save Configuration"** to persist changes

### 3. Generate Single Certificate

1. Click **"🎯 Generate"** from the template card
2. Enter recipient information:
   - Recipient name
   - Any custom fields (date, course, etc.)
3. **Live Preview** updates automatically on the left
4. Click **"Generate & Download Certificate"** to create PDF

### 4. Bulk Certificate Generation & Email

1. Click **"📧 Bulk"** on any template card
2. Enter Gmail credentials (see [Gmail Setup](#-gmail-setup-for-bulk-email))
3. Upload a CSV file with recipient data:
   - Format: `name,email`
   - Example:
     ```csv
     name,email
     John Doe,john@example.com
     Jane Smith,jane@example.com
     ```
4. Click **"Generate & Send Certificates"**
5. View progress and results after completion

#### CSV File Format

```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
Mike Johnson,mike@example.com
```

**Requirements:**
- First row must be headers: `name,email`
- Each subsequent row: recipient name, email address
- Use commas to separate values

**Download Sample CSV** button is available in the bulk generation page.

---

## 📧 Gmail Setup for Bulk Email

To send certificates via email, you need to configure Gmail with an **App Password** (not your regular password).

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **"2-Step Verification"**
3. Follow the setup prompts

### Step 2: Generate App Password

1. Visit [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** for app type
3. Select **"Other (Custom name)"** for device
4. Enter a name: **"CertiGen"**
5. Click **"Generate"**
6. Copy the **16-character password** (remove spaces)

### Step 3: Update `.env` File

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # The 16-character app password
EMAIL_FROM_NAME=CertiGen
```

### Testing Email Configuration

```powershell
cd backend
node test-email.js
```

This sends a test email to verify your configuration is working correctly.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Template Endpoints

#### Upload Template
```http
POST /api/templates/upload
Content-Type: multipart/form-data

Body:
- template: File (image)
- templateName: String

Response: 201 Created
{
  "success": true,
  "data": {
    "templateId": "uuid",
    "templateName": "string",
    "imageUrl": "string",
    "dimensions": { "width": 1122, "height": 794 }
  }
}
```

#### Save Text Fields Configuration
```http
POST /api/templates/:templateId/fields
Content-Type: application/json

Body:
{
  "textFields": [
    {
      "fieldId": "field-1",
      "fieldName": "recipientName",
      "x": 45.5,
      "y": 52.3,
      "width": 35,
      "height": 8,
      "fontSize": 48,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "alignment": "center",
      "color": "#000000"
    }
  ]
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated template */ }
}
```

#### Get Template by ID
```http
GET /api/templates/:templateId

Response: 200 OK
{
  "success": true,
  "data": { /* template object */ }
}
```

#### List All Templates
```http
GET /api/templates

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [ /* array of templates */ ]
}
```

#### Delete Template
```http
DELETE /api/templates/:templateId

Response: 200 OK
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Certificate Endpoints

#### Generate Single Certificate
```http
POST /api/certificates/generate
Content-Type: application/json

Body:
{
  "templateId": "uuid",
  "recipientName": "John Doe",
  "customFields": {
    "date": "2025-11-27",
    "course": "React Development"
  }
}

Response: 200 OK (PDF file binary)
```

#### Generate Certificate Preview
```http
POST /api/certificates/preview
Content-Type: application/json

Body:
{
  "templateId": "uuid",
  "recipientName": "John Doe",
  "customFields": {}
}

Response: 200 OK
{
  "success": true,
  "data": {
    "preview": "data:image/png;base64,..."
  }
}
```

#### Bulk Generate & Email Certificates
```http
POST /api/certificates/bulk-generate
Content-Type: multipart/form-data

Body:
- templateId: String
- csvFile: File
- emailUser: String
- emailPassword: String
- fromName: String (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "totalRecipients": 10,
    "successCount": 9,
    "failedCount": 1,
    "failed": [
      {
        "name": "John Doe",
        "email": "invalid-email",
        "error": "Invalid email address"
      }
    ]
  }
}
```

---

## 🔧 Development

### Backend Commands

```powershell
cd backend

# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Test email configuration
node test-email.js
```

### Frontend Commands

```powershell
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Implementation Details

#### Dynamic Font Sizing Algorithm

The system automatically adjusts font size to fit text within defined boundaries:

1. Starts with the configured font size
2. Measures text width using server-side canvas
3. Reduces font size in 0.5px increments if text exceeds width
4. Stops at minimum font size (20px)
5. Truncates with ellipsis (`...`) if minimum size still exceeds width

#### Coordinate System

- All positions stored as **percentages** (0-100) for responsiveness
- Converted to pixels during rendering based on actual dimensions
- Ensures consistent positioning across different display sizes and resolutions

#### A4 Landscape Validation

Templates must match A4 landscape aspect ratio:
- Standard: **1122×794 pixels** at 72 DPI
- Aspect ratio: **1.413** (A4 landscape)
- Allows 5% tolerance for slight variations
- Rejects images that don't meet ratio requirements

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running:
  ```powershell
  Start-Service MongoDB
  # OR
  mongod
  ```
- Verify MongoDB URI in `.env` file
- Check if MongoDB is accessible on port 27017
- Ensure MongoDB service is installed correctly

### File Upload Error

**Error:** "Invalid file type" or "File too large"

**Solutions:**
- Use only **PNG, JPG, or JPEG** formats
- Keep file size **under 5MB**
- Ensure image has A4 landscape dimensions (aspect ratio ~1.413)
- Recommended: 1122×794 pixels

### CORS Error

**Error:** Cross-origin request blocked

**Solutions:**
- Verify backend is running on port **5000**
- Check `ALLOWED_ORIGINS` in backend `.env`
- Ensure frontend proxy is configured in `vite.config.js`
- Clear browser cache and restart both servers

### Email Sending Fails

**Error:** "Invalid login" or "Authentication failed"

**Solutions:**
- Verify you're using **App Password**, not regular Gmail password
- Ensure 2-Step Verification is enabled on Gmail
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Test email configuration with `node test-email.js`
- Remove any spaces from the 16-character app password

### Canvas Rendering Issues

**Error:** Text not appearing or misaligned

**Solutions:**
- Clear browser cache and refresh
- Ensure template has valid image URL
- Verify text field coordinates are within 0-100%
- Check browser console for JavaScript errors

### Frontend Build Issues

**Error:** Module not found or dependency errors

**Solutions:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 🚢 Deployment

### Backend Deployment (Heroku Example)

```powershell
# Install Heroku CLI and login
heroku login

# Create app
heroku create certigen-api

# Set environment variables
heroku config:set MONGODB_URI="your-production-mongodb-uri"
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS="https://your-frontend-domain.com"
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASSWORD="your-app-password"

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Vercel Example)

```powershell
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Set environment variable in Vercel dashboard
# VITE_API_URL=https://your-backend-domain.com/api
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB URI (MongoDB Atlas recommended)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure proper CORS origins
- [ ] Set secure Gmail App Password
- [ ] Enable rate limiting and security headers
- [ ] Implement user authentication (if needed)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups for MongoDB
- [ ] Test email delivery in production

---

## 🔐 Security Considerations

### Implemented
- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ Input sanitization
- ✅ CORS protection
- ✅ Rate limiting on API endpoints
- ✅ Helmet.js security headers
- ✅ Gmail App Password (secure email authentication)

### Recommended for Production
- ⚠️ Add user authentication (JWT, OAuth)
- ⚠️ Implement role-based authorization
- ⚠️ Use HTTPS/TLS encryption
- ⚠️ Encrypt sensitive data at rest
- ⚠️ Add request validation middleware
- ⚠️ Implement audit logging
- ⚠️ Use environment-based secrets management

---

## 📝 License

MIT License

Copyright (c) 2025 CertiGen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or support:

1. Check the [Troubleshooting section](#-troubleshooting)
2. Review [API Documentation](#-api-documentation)
3. Check console logs for error details
4. Verify all dependencies are installed correctly
5. Open an issue on GitHub (if applicable)

---

## 🙏 Acknowledgments

- Built with the MERN stack
- PDF generation powered by PDFKit
- Email delivery via Nodemailer
- UI components built with React
- Bundled with Vite for optimal performance

---

**Version:** 1.0.0  
**Last Updated:** December 30, 2025

---

Made with ❤️ using the MERN stack
