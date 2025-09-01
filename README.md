

# Social Media Content Analyzer

The Social Media Content Analyzer is a full-stack web application designed to extract text from PDF and image files and provide AI-powered analysis to improve social media engagement. Users can upload a document, and the application will not only extract the text but also suggest grammatical improvements, relevant hashtags, and actionable advice to make the content more compelling.

This project was developed as a technical assessment to demonstrate proficiency in building practical, real-world applications using modern web technologies.

## Live Application URL
You can access the deployed application here:
[https://social-media-analyzer-frontend-wva8.onrender.com](https://social-media-analyzer-frontend-wva8.onrender.com)

## ✨ Features
- **Dual Upload Functionality**: Separate, intuitive interfaces for uploading both PDF and image files.
- **Drag-and-Drop Support**: Modern, user-friendly drag-and-drop zones for easy file selection.
- **Standard PDF Parsing**: Quickly extracts text from standard, text-based PDF files.
- **Advanced OCR**: Utilizes Optical Character Recognition (OCR) to accurately extract text from scanned PDFs and various image formats (PNG, JPG, etc.).
- **AI-Powered Content Analysis**: Integrates with the Google Gemini API to:
  - Correct grammar and spelling.
  - Suggest relevant and trending hashtags.
  - Provide actionable engagement advice.
- **Secure & Scalable Backend**: Built with Node.js and Express, designed for secure handling of file uploads and API keys.
- **Clear User Feedback**: Implements loading states and robust error handling to ensure a smooth user experience.

## 🛠️ Tech Stack
The project is a monorepo containing a separate frontend and backend.

### Frontend
- **Framework**: React (with Vite for fast development)
- **Styling**: CSS
- **HTTP Client**: Axios
- **File Handling**: React-Dropzone

### Backend
- **Framework**: Node.js with Express
- **File Uploads**: Multer
- **PDF Parsing**: pdf-parse
- **OCR Engine**: tesseract.js
- **AI Service**: Google Gemini API

### Deployment
Both frontend and backend services are deployed on Render.com.

## 📁 Directory Structure
```
social-media-analyzer/
├── backend/
│   ├── uploads/          # Temporarily stores uploaded files
│   ├── node_modules/
│   ├── .env              # For environment variables (API key)
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── app.js         # Main Express server file
│
└── frontend/
    ├── dist/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── Upload.jsx    # The main React component
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

## 🚀 Local Setup and Installation
To run this project on your local machine, follow these steps:

### Prerequisites
- Node.js and npm installed.
- A Google Gemini API key.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd social-media-analyzer
```

### 2. Set Up the Backend
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create an environment file
touch .env

# Add your Gemini API key to the .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Start the backend server
npm start
```
The backend server will be running on `http://localhost:4040`.

### 3. Set Up the Frontend
```bash
# Navigate to the frontend directory from the root
cd ../frontend

# Install dependencies
npm install

# IMPORTANT: Temporarily change the API_URL in src/components/Upload.jsx
# to point to your local backend for testing.
# const API_URL = "http://localhost:4040";

# Start the frontend development server
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

## ☁️ Deployment
- The application is deployed on Render as two separate services: a Static Site for the React frontend and a Web Service for the Node.js backend.
- **Continuous Deployment**: The services are linked to the GitHub repository's main branch. Any push to `main` automatically triggers a new deployment for the respective service.
- **Environment Variables**: The GEMINI_API_KEY is securely stored in the backend service's environment variables on Render.
- **CORS**: The backend is configured to only accept requests from the deployed frontend URL and localhost for development, ensuring secure communication between the services.


