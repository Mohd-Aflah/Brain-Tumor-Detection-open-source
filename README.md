# 🧠 Brain Tumor Detection System

A minimal, educational web app that detects and segments brain tumor regions from MRI images using Ultralytics YOLO (tested with YOLOv11 Nano). Runs locally with a simple Flask backend and browser UI. If `best.pt` is missing, the app attempts a fallback to `yolov8n-seg.pt`.

## Quick Start (Windows Power*Shell)

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 and upload an MRI image.

## Usage

- Supported formats: JPG, JPEG, PNG, BMP, TIFF
- Max file size: 16MB
- Results: Cyan overlay highlights detected regions; originals and results saved under `static/uploads` and `static/results`
- Model: Uses `best.pt` in project root; falls back to Ultralytics default `yolov8n-seg.pt` if available

## Notes & Limits

- CPU-friendly; speed depends on your hardware
- No DICOM/PACS/EMR integration; no cloud uploads
- Educational demo only; no clinical guarantees

## Project Layout (essentials)

```
app.py                 # Flask server + inference
best.pt                # Trained model (optional)
requirements.txt       # Dependencies
templates/             # HTML pages
static/uploads/        # Uploaded images
static/results/        # Processed outputs
Documentation/         # Guides and reports
```

## Disclaimer

This project is for educational and research purposes only. It is not a medical device and must not be used for diagnosis or treatment decisions.

— Last updated: 2025-11-26
