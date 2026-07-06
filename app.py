"""
Brain Tumor Analysis System v1.0
================================

A simplified, modern web application for brain tumor detection and analysis
using YOLO deep learning for medical image segmentation.

Features:
- Upload MRI brain scans
- AI-powered tumor detection
- Detailed medical analysis
- Criticality assessment
- Confidence scoring

Disclaimer: NOT FOR MEDICAL USE. This is an open-source project intended for college projects, research, and learning purposes. Anyone can access, download, and use it.

Author: mohd-aflah(github)
Version: 1.0
"""

import os
import time
import uuid
import logging
from pathlib import Path
from datetime import datetime
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
import cv2
import numpy as np
from PIL import Image

# AI imports with fallback
try:
    from ultralytics import YOLO
    import torch
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠️ AI libraries not available - install ultralytics and torch")

# =================== CONFIGURATION ===================

class Config:
    """Application configuration"""
    APP_NAME = "Brain Tumor Analysis"
    VERSION = "1.0"
    DEBUG = True
    HOST = '127.0.0.1'
    PORT = 5000
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}

# =================== SETUP ===================

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_FILE_SIZE

# Directories
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / 'static' / 'uploads'
RESULTS_DIR = BASE_DIR / 'static' / 'results'

# Create directories
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =================== AI MODEL ===================

model = None
device = 'cpu'

if AI_AVAILABLE:
    try:
        # Check for GPU
        if torch.cuda.is_available():
            device = 'cuda'
            logger.info(f"🎮 Using GPU: {torch.cuda.get_device_name(0)}")
        
        # Load model
        model_path = "best.pt"
        if os.path.exists(model_path):
            model = YOLO(model_path)
            model.to(device)
            logger.info("✅ Brain tumor model loaded successfully")
        else:
            logger.warning("⚠️ Trained model not found, using default")
            model = YOLO('yolov8n-seg.pt')
            model.to(device)
    except Exception as e:
        logger.error(f"❌ Model loading failed: {e}")

# =================== MEDICAL ANALYSIS ===================

class TumorAnalyzer:
    """Medical tumor analysis and assessment"""
    
    @staticmethod
    def assess_criticality(tumor_size_percentage, confidence):
        """Assess tumor criticality based on size and confidence"""
        if tumor_size_percentage > 15:
            return "CRITICAL", "🔴", "Immediate medical attention required"
        elif tumor_size_percentage > 8:
            return "HIGH RISK", "🟠", "Urgent consultation recommended"
        elif tumor_size_percentage > 3:
            return "MODERATE", "🟡", "Medical follow-up advised"
        elif tumor_size_percentage > 1:
            return "LOW RISK", "🟢", "Monitor with regular check-ups"
        else:
            return "MINIMAL", "⚪", "Continue routine monitoring"
    
    @staticmethod
    def calculate_tumor_metrics(masks, image_shape):
        """Calculate detailed tumor metrics"""
        if not masks:
            return {}
        
        total_pixels = image_shape[0] * image_shape[1]
        
        # Create a single combined boolean mask to avoid double-counting overlapping regions
        combined_mask = np.any(np.array(masks) > 0.5, axis=0)
        tumor_pixels = np.sum(combined_mask)
        
        # Calculate percentage
        percentage = (tumor_pixels / total_pixels) * 100
        
        # Calculate volume estimation (simplified)
        volume_mm3 = tumor_pixels * 0.5  # Approximate voxel size
        
        # Find largest individual tumor size for metrics
        largest_tumor = max(np.sum(mask > 0.5) for mask in masks)
        largest_percentage = (largest_tumor / total_pixels) * 100
        
        return {
            'total_tumor_pixels': int(tumor_pixels),
            'total_brain_pixels': int(total_pixels),
            'tumor_percentage': round(percentage, 2),
            'estimated_volume_mm3': round(volume_mm3, 1),
            'largest_tumor_percentage': round(largest_percentage, 2),
            'num_tumors': len(masks)
        }

# =================== ROUTES ===================

@app.route('/')
def home():
    """Home page"""
    return render_template('index.html')

@app.route('/analyze')
def analyze():
    """Analysis page"""
    return render_template('analyze.html')

@app.route('/api/upload', methods=['POST'])
def upload_and_analyze():
    """Upload and analyze brain scan"""
    if not model:
        return jsonify({
            'success': False, 
            'error': 'AI model not available'
        }), 500
    
    if 'file' not in request.files:
        return jsonify({
            'success': False, 
            'error': 'No file uploaded'
        }), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'success': False, 
            'error': 'No file selected'
        }), 400
    
    # Validate file
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in Config.ALLOWED_EXTENSIONS:
        return jsonify({
            'success': False, 
            'error': f'Invalid file type. Use: {", ".join(Config.ALLOWED_EXTENSIONS)}'
        }), 400
    
    try:
        # Save file with UUID to prevent collisions
        unique_id = uuid.uuid4().hex[:8]
        filename = secure_filename(file.filename)
        safe_filename = f"{unique_id}_{filename}"
        file_path = UPLOAD_DIR / safe_filename
        file.save(str(file_path))
        
        # Load image
        image = cv2.imread(str(file_path))
        
        # Limit resolution to prevent OOM errors and speed up inference (Max 1024x1024)
        max_dim = 1024
        h, w = image.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            cv2.imwrite(str(file_path), image) # Resave downscaled version

        original_image = image.copy()
        
        # Run AI analysis
        logger.info("🔬 Starting tumor analysis...")
        start_time = time.time()
        
        results = model(str(file_path), conf=0.25, save=False)
        
        processing_time = time.time() - start_time
        
        # Process results
        analysis_data = {
            'timestamp': datetime.now().isoformat(),
            'processing_time': round(processing_time, 2),
            'tumors_detected': 0,
            'confidence_scores': [],
            'medical_assessment': {}
        }
        
        result_image = original_image.copy()
        tumor_masks = []
        
        if results[0].masks is not None:
            masks = results[0].masks.data.cpu().numpy()
            boxes = results[0].boxes.data.cpu().numpy() if results[0].boxes else []
            
            analysis_data['tumors_detected'] = len(masks)
            
            # Resize all masks to image dimensions using list comprehension
            h, w = image.shape[:2]
            tumor_masks = [cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST) for mask in masks]
            
            if tumor_masks:
                # Combine all masks into a single boolean array for visualization
                combined_mask = np.any(np.array(tumor_masks) > 0.5, axis=0)
                
                # Create colored overlay in one shot
                colored_mask = np.zeros_like(image)
                colored_mask[combined_mask] = [0, 255, 255]  # Cyan for tumors
                
                # Blend with image once
                result_image = cv2.addWeighted(result_image, 0.7, colored_mask, 0.3, 0)

            # Add confidence scores
            for i, box in enumerate(boxes):
                if len(box) > 4:
                    confidence = float(box[4])
                    analysis_data['confidence_scores'].append(round(confidence, 3))
            
            # Calculate medical metrics
            tumor_metrics = TumorAnalyzer.calculate_tumor_metrics(
                tumor_masks, image.shape[:2]
            )
            
            # Assess criticality
            avg_confidence = np.mean(analysis_data['confidence_scores']) if analysis_data['confidence_scores'] else 0
            criticality, status_icon, recommendation = TumorAnalyzer.assess_criticality(
                tumor_metrics.get('tumor_percentage', 0), avg_confidence
            )
            
            analysis_data['medical_assessment'] = {
                **tumor_metrics,
                'criticality_level': criticality,
                'status_icon': status_icon,
                'medical_recommendation': recommendation,
                'average_confidence': round(avg_confidence, 3),
                'confidence_interpretation': 'High' if avg_confidence > 0.7 else 'Moderate' if avg_confidence > 0.5 else 'Low'
            }
        
        # Save result image
        result_filename = f"result_{safe_filename}"
        result_path = RESULTS_DIR / result_filename
        cv2.imwrite(str(result_path), result_image)
        
        # Response
        response = {
            'success': True,
            'message': 'Analysis completed successfully',
            'data': analysis_data,
            'images': {
                'original': url_for('static', filename=f'uploads/{safe_filename}'),
                'result': url_for('static', filename=f'results/{result_filename}')
            }
        }
        
        logger.info(f"✅ Analysis complete: {analysis_data['tumors_detected']} tumors found")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/api/status')
def get_status():
    """Get system status"""
    return jsonify({
        'app_name': Config.APP_NAME,
        'version': Config.VERSION,
        'ai_available': AI_AVAILABLE,
        'model_loaded': model is not None,
        'device': device,
        'status': 'operational'
    })

@app.route('/print-report')
def print_report():
    """Generate printable medical report"""
    # Get analysis data from request parameters
    analysis_data = {
        'analysisDate': request.args.get('date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
        'imageFile': request.args.get('filename', 'Unknown'),
        'processTime': request.args.get('process_time', 'N/A'),
        'tumorsDetected': request.args.get('tumors_detected', '0'),
        'confidenceLevel': request.args.get('confidence', 'N/A'),
        'largestSize': request.args.get('largest_size', 'N/A'),
        'totalArea': request.args.get('total_area', 'N/A'),
        'originalImage': request.args.get('original_image', ''),
        'resultImage': request.args.get('result_image', ''),
        'tumorDetails': [],
        'recommendations': []
    }
    
    # Parse tumor details if provided
    tumor_count = int(request.args.get('tumor_count', 0))
    for i in range(tumor_count):
        tumor_data = {
            'size': request.args.get(f'tumor_{i}_size', 'N/A'),
            'confidence': request.args.get(f'tumor_{i}_confidence', 'N/A'),
            'location': request.args.get(f'tumor_{i}_location', 'N/A'),
            'assessment': request.args.get(f'tumor_{i}_assessment', 'Under Review')
        }
        analysis_data['tumorDetails'].append(tumor_data)
    
    # Generate recommendations based on findings
    if tumor_count > 0:
        analysis_data['recommendations'] = [
            "Consult with a neurologist or neurosurgeon for professional evaluation",
            "Consider additional imaging studies (contrast MRI, CT scan) as recommended by physician",
            "Maintain regular follow-up appointments for monitoring",
            "Discuss treatment options with your healthcare team",
            "Seek second opinion if significant findings are detected"
        ]
    else:
        analysis_data['recommendations'] = [
            "Continue routine medical check-ups as recommended by your physician",
            "Maintain healthy lifestyle and monitor for any new symptoms",
            "Follow up with periodic imaging if clinically indicated"
        ]
    
    return render_template('print_report.html', data=analysis_data)

# =================== ERROR HANDLERS ===================

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size: 16MB'
    }), 413

@app.errorhandler(404)
def not_found(error):
    return render_template('error.html', error_code=404), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('error.html', error_code=500), 500

# =================== MAIN ===================

if __name__ == '__main__':
    print("\n" + "="*50)
    print(f"🧠 {Config.APP_NAME} v{Config.VERSION}")
    print("="*50)
    print(f"🌐 URL: http://{Config.HOST}:{Config.PORT}")
    print(f"🔬 AI: {'Available' if AI_AVAILABLE else 'Not Available'}")
    print(f"🖥️ Device: {device.upper()}")
    print("="*50)
    
    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )