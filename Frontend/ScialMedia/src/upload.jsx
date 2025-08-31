import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./Upload.css"; // Make sure to create this CSS file

// CHANGED FOR DEPLOYMENT: Switched back to using an environment variable.
const API_URL = "https://social-media-analyzer-wrvf.onrender.com";

function Upload() {
  // --- STATE MANAGEMENT ---

  // State for files
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  // State for PDF processing
  const [pdfScanned, setPdfScanned] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [analyzePdf, setAnalyzePdf] = useState(false);
  const [pdfAnalysis, setPdfAnalysis] = useState("");
  const [isPdfAnalyzing, setIsPdfAnalyzing] = useState(false);

  // State for Image processing
  const [imageText, setImageText] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [analyzeImage, setAnalyzeImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState("");
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);

  // --- DROPZONE SETUP ---
  const { getRootProps: getPdfRoot, getInputProps: getPdfInput, isDragActive: isPdfActive } = useDropzone({
    onDrop: (files) => setPdfFile(files[0]),
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const { getRootProps: getImgRoot, getInputProps: getImgInput, isDragActive: isImgActive } = useDropzone({
    onDrop: (files) => setImageFile(files[0]),
    accept: { "image/*": [] },
    multiple: false,
  });

  // --- CORE FUNCTIONS ---
  const uploadPdf = () => {
    if (!pdfFile) {
        setPdfError("Please select or drop a PDF file first.");
        return;
    }
    
    setIsPdfLoading(true);
    if (analyzePdf) setIsPdfAnalyzing(true);
    setPdfText("");
    setPdfError("");
    setPdfAnalysis("");

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("scanned", pdfScanned);
    formData.append("analyze", analyzePdf);

    axios
      .post(`${API_URL}/upload-pdf`, formData)
      .then((res) => {
        setPdfText(res.data.text || "No text could be extracted.");
        if (res.data.analysis) {
            setPdfAnalysis(res.data.analysis);
        }
      })
      .catch((err) => {
        const message = err.response?.data || "PDF processing failed. The server might be busy or down.";
        setPdfError(message);
        console.error(err);
      })
      .finally(() => {
        setIsPdfLoading(false);
        setIsPdfAnalyzing(false);
      });
  };

  const uploadImage = () => {
    if (!imageFile) {
        setImageError("Please select or drop an image file first.");
        return;
    }
    
    setIsImageLoading(true);
    if (analyzeImage) setIsImageAnalyzing(true);
    setImageText("");
    setImageError("");
    setImageAnalysis("");

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("analyze", analyzeImage);

    axios
      .post(`${API_URL}/upload-image`, formData)
      .then((res) => {
        setImageText(res.data.text || "No text could be extracted.");
        if (res.data.analysis) {
            setImageAnalysis(res.data.analysis);
        }
      })
      .catch((err) => {
        const message = err.response?.data || "Image processing failed. The server might be busy or down.";
        setImageError(message);
        console.error(err);
      })
      .finally(() => {
        setIsImageLoading(false);
        setIsImageAnalyzing(false);
      });
  };

  // --- RENDER ---
  return (
    <div className="uploader-container">
      {/* PDF Uploader Section */}
      <section className="uploader-block">
        <h2 className="title">PDF Text Extractor</h2>
        <div {...getPdfRoot()} className={`dropzone ${isPdfActive ? "dropzone--active" : ""}`}>
          <input {...getPdfInput()} />
          <p className="dropzone__hint">{pdfFile ? pdfFile.name : "Drag & drop PDF here, or click to select"}</p>
        </div>

        <div className="controls">
          <label className="checkbox-label"><input type="checkbox" checked={pdfScanned} onChange={() => setPdfScanned(!pdfScanned)}/><span>Scanned PDF </span></label>
          <label className="checkbox-label"><input type="checkbox" checked={analyzePdf} onChange={() => setAnalyzePdf(!analyzePdf)}/><span>Social Media Analysis</span></label>
        </div>
        <button className="btn" onClick={uploadPdf} disabled={isPdfLoading || isPdfAnalyzing}>
          {isPdfLoading ? "Extracting..." : isPdfAnalyzing ? "Analyzing..." : "Process PDF"}
        </button>

        {(isPdfLoading || isPdfAnalyzing) && <div className="loading-notice">Processing PDF... This can take some time. Please wait.</div>}
        {pdfError && <div className="error-notice">{pdfError}</div>}
        
        {pdfText && (
            <div className="result-wrapper">
                <h3>Extracted Text:</h3>
                <textarea className="result-text" readOnly value={pdfText} />
            </div>
        )}
        {isPdfAnalyzing && !pdfAnalysis && <div className="loading-notice">AI is analyzing the post...</div>}
        {pdfAnalysis && (
            <div className="result-wrapper analysis-result">
                <h3>Social Media Analysis:</h3>
                <pre className="result-text">{pdfAnalysis}</pre>
            </div>
        )}
      </section>

      {/* Image Uploader Section */}
      <section className="uploader-block">
        <h2 className="title">Image Text Extractor (OCR)</h2>
        <div {...getImgRoot()} className={`dropzone ${isImgActive ? "dropzone--active" : ""}`}>
          <input {...getImgInput()} />
          <p className="dropzone__hint">{imageFile ? imageFile.name : "Drag & drop Image here, or click to select"}</p>
        </div>

        <div className="controls">
          <label className="checkbox-label"><input type="checkbox" checked={analyzeImage} onChange={() => setAnalyzeImage(!analyzeImage)}/><span>Social Media Analysis</span></label>
        </div>
        <button className="btn" onClick={uploadImage} disabled={isImageLoading || isImageAnalyzing}>
          {isImageLoading ? "Extracting..." : isImageAnalyzing ? "Analyzing..." : "Process Image"}
        </button>
        
        {(isImageLoading || isImageAnalyzing) && <div className="loading-notice">Processing Image... Please wait.</div>}
        {imageError && <div className="error-notice">{imageError}</div>}
        
        {imageText && (
            <div className="result-wrapper">
                <h3>Extracted Text:</h3>
                <textarea className="result-text" readOnly value={imageText} />
            </div>
        )}
        {isImageAnalyzing && !imageAnalysis && <div className="loading-notice">AI is analyzing the post...</div>}
        {imageAnalysis && (
            <div className="result-wrapper analysis-result">
                <h3>Social Media Analysis:</h3>
                <pre className="result-text">{imageAnalysis}</pre>
            </div>
        )}
      </section>
    </div>
  );
}

export default Upload;
