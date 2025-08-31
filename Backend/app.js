/**
 * A Node.js server using Express to extract text and perform AI analysis.
 * - Handles file uploads using multer.
 * - Uses 'pdf-parse' for standard PDFs and 'tesseract.js' for scanned PDFs/images.
 * - Integrates with the Google Gemini API for AI-powered content analysis.
 * - Securely manages API keys using environment variables.
 */

// Core dependencies
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // For making HTTP requests to Gemini API

// PDF and OCR processing libraries
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { createCanvas } = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

// --- 1. SERVER AND FILE STORAGE SETUP ---
console.log("Initializing server setup...");

const app = express();

// CHANGED: Using a more robust CORS configuration with a whitelist
const whitelist = [
    'https://social-media-analyzer-frontend-wva8.onrender.com', 
    'http://localhost:3000', // For local development
    'http://localhost:5173'  // Default for Vite dev server
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueFilename = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueFilename);
    }
});
const upload = multer({ storage });

console.log("Server setup and multer configuration complete.");

// --- 2. AI INTEGRATION HELPER ---
/**
 * Calls the Gemini API to get social media analysis for the given text.
 * @param {string} text The text to be analyzed.
 * @returns {Promise<string>} The analysis from the AI.
 */
const getSocialMediaAnalysis = async (text) => {
    console.log("[AI Service]: Requesting social media analysis from Gemini...");

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const prompt = `You are a world-class social media strategist. Analyze the following post text. Your task is to:
1. Correct any grammar and spelling mistakes to make it sound professional and clear.
2. Suggest a list of 5 to 10 relevant and trending hashtags to maximize reach.
3. Provide a short, actionable paragraph of advice on how to make the post more engaging.

Format your response in Markdown with clear headings for "Improved Text", "Suggested Hashtags", and "Engagement Advice".

Here is the post text:
---
${text}
---`;

    try {
        const response = await axios.post(apiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const candidate = response.data.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            console.log("[AI Service]: Analysis received successfully.");
            return candidate.content.parts[0].text;
        } else {
            console.error("[AI Service Error]: Unexpected API response structure:", response.data);
            throw new Error("Failed to parse analysis from the AI response.");
        }
    } catch (error) {
        console.error("[AI Service Error]: API call failed.", error.response ? error.response.data : error.message);
        throw new Error(`AI analysis failed: ${error.message}`);
    }
};


// --- 3. HELPER CLASS FOR PDF.JS IN NODE ---
class NodeCanvasFactory {
    create(width, height) {
        const canvas = createCanvas(width, height);
        return { canvas, context: canvas.getContext("2d") };
    }
    reset(canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

// --- 4. API ENDPOINTS ---

/**
 * Endpoint for PDF files. Extracts text and optionally performs AI analysis.
 */
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
    console.log("\n--- Received request for /upload-pdf ---");
    if (!req.file) return res.status(400).send("No file uploaded.");

    const filePath = req.file.path;
    let extractedText = "";

    try {
        const isScanned = req.body.scanned === "true";
        const shouldAnalyze = req.body.analyze === "true";
        console.log(`Processing mode: ${isScanned ? 'SCANNED' : 'STANDARD'}. Analysis requested: ${shouldAnalyze}`);

        const dataBuffer = fs.readFileSync(filePath);

        if (!isScanned) {
            console.log("[Standard PDF]: Extracting text...");
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else {
            console.log("[Scanned PDF]: Starting OCR process...");
            const data = new Uint8Array(dataBuffer);
            const doc = await pdfjsLib.getDocument({ data }).promise;
            const canvasFactory = new NodeCanvasFactory();
            for (let i = 1; i <= doc.numPages; i++) {
                console.log(`[Scanned PDF]: Processing page ${i}...`);
                const page = await doc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
                await page.render({
                    canvasContext: canvasAndContext.context,
                    viewport: viewport,
                    canvasFactory: canvasFactory,
                }).promise;
                const imageBuffer = canvasAndContext.canvas.toBuffer("image/png");
                const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
                extractedText += text + "\n";
                page.cleanup();
                canvasFactory.destroy(canvasAndContext);
            }
        }
        console.log("Text extraction complete.");

        // Conditionally call the AI analysis function
        let analysisResult = null;
        if (shouldAnalyze && extractedText.trim()) {
            analysisResult = await getSocialMediaAnalysis(extractedText);
        }

        res.json({ text: extractedText, analysis: analysisResult });

    } catch (err) {
        console.error("[FATAL ERROR] in /upload-pdf:", err);
        res.status(500).send("Failed to process PDF.");
    } finally {
        // Cleanup the uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[Cleanup]: Deleted temporary file: ${filePath}`);
        }
    }
});


/**
 * Endpoint for Image files. Extracts text via OCR and optionally performs AI analysis.
 */
app.post('/upload-image', upload.single('file'), async (req, res) => {
    console.log("\n--- Received request for /upload-image ---");
    if (!req.file) return res.status(400).send("No file uploaded.");

    const filePath = req.file.path;
    let extractedText = "";

    try {
        const shouldAnalyze = req.body.analyze === "true";
        console.log(`Processing image. Analysis requested: ${shouldAnalyze}`);

        console.log("[Image OCR]: Starting text extraction with Tesseract...");
        const { data: { text } } = await Tesseract.recognize(filePath, "eng");
        extractedText = text;
        console.log("[Image OCR]: Text extraction complete.");

        // Conditionally call the AI analysis function
        let analysisResult = null;
        if (shouldAnalyze && extractedText.trim()) {
            analysisResult = await getSocialMediaAnalysis(extractedText);
        }

        res.json({ text: extractedText, analysis: analysisResult });

    } catch (err) {
        console.error("[FATAL ERROR] in /upload-image:", err);
        res.status(500).send("Failed to extract image text.");
    } finally {
        // Cleanup the uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[Cleanup]: Deleted temporary file: ${filePath}`);
        }
    }
});


// --- 5. START THE SERVER ---
const PORT =  process.env.PORT || 4040;
app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`Server is running and listening on port ${PORT}`);
    console.log("=============================================\n");
});

