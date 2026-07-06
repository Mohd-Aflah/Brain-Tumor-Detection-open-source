# 🧠 Brain Tumor Detection System

A comprehensive, educational, and fast open-source web application designed for detecting and segmenting brain tumor regions from MRI images. Built using Ultralytics YOLO and a Flask backend, this system is perfect for college projects, research, and learning about AI in healthcare. 

Anyone can access, download, run, and use this project freely as a college project or for other non-commercial uses. It features a modern browser UI for easy interaction.

## 🌟 Key Features

- **Upload MRI Scans**: Easy-to-use web interface for uploading MRI images (Supports JPG, JPEG, PNG, BMP, TIFF).
- **AI-Powered Detection**: Uses a YOLO deep learning model to accurately detect and highlight tumor regions with a cyan overlay.
- **Detailed Medical Analysis**: Calculates tumor area, location, and confidence levels.
- **Criticality Assessment**: Automatically evaluates the severity based on the tumor size and model confidence.
- **Printable Reports**: Generate and print detailed medical reports of the analysis.
- **Local Execution**: Runs entirely on your local machine—no cloud API keys required, ensuring complete privacy.

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have Python (preferably 3.10) installed on your system.

### Installation

1. **Clone or Download the Repository**
   Download the project files to your local machine and navigate to the project directory in your terminal or PowerShell.

2. **Set up a Virtual Environment (Recommended)**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Dependencies**
   Install the required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Run the Application**
   Start the Flask web server:
   ```powershell
   python app.py
   ```

5. **Open in Browser**
   Open your web browser and go to `http://127.0.0.1:5000` to access the application.

## 📂 Project Structure

```text
app.py                 # Main Flask server application and inference logic
best.pt                # Custom trained YOLO model for brain tumor detection
requirements.txt       # Python dependencies required to run the project
templates/             # HTML templates for the frontend UI
static/css/            # CSS stylesheets for the UI
static/js/             # JavaScript files for frontend logic
static/uploads/        # Directory where uploaded images are saved
static/results/        # Directory where processed images with overlays are saved
Training/              # Contains the Jupyter Notebook for training the AI model
```

## 🛠️ Technology Stack

- **Backend**: Python, Flask
- **AI / Deep Learning**: PyTorch, Ultralytics YOLO
- **Image Processing**: OpenCV, Pillow
- **Frontend**: HTML5, CSS3, JavaScript

## 📝 Usage Notes & Limitations

- The maximum allowed file size for uploads is 16MB.
- Processing speed depends on your local hardware (CPU vs GPU).
- If the custom trained `best.pt` model is missing, the app will automatically fall back to the Ultralytics default `yolov8n-seg.pt`.
- This is an offline application. No DICOM/PACS/EMR integration or cloud uploads are performed.

## ⚠️ Disclaimer

**NOT FOR MEDICAL USE.** This project is built for **educational, open-source, and research purposes only**, making it an ideal reference for college projects and medical AI enthusiasts. It is **not** a certified medical device and must not be used for actual clinical diagnosis, medical advice, or treatment decisions.

---

**Author: mohd-aflah(github)**
