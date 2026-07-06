/**
 * Brain Tumor Analysis System v1.0 - Analysis JavaScript
 * =======================================================
 * 
 * Handles file upload, analysis processing, and results display
 */

class BrainAnalyzer {
    constructor() {
        this.selectedFile = null;
        this.isAnalyzing = false;
        
        this.initializeElements();
        this.bindEvents();
        
        console.log('🔬 Brain Analyzer initialized');
    }
    
    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFileBtn = document.getElementById('removeFile');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.analyzeText = document.getElementById('analyzeText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.medicalSummary = document.getElementById('medicalSummary');
        this.criticalityBadge = document.getElementById('criticalityBadge');
        this.tumorsCount = document.getElementById('tumorsCount');
        this.tumorPercentage = document.getElementById('tumorPercentage');
        this.confidenceLevel = document.getElementById('confidenceLevel');
        this.processingTime = document.getElementById('processingTime');
        this.medicalRecommendation = document.getElementById('medicalRecommendation');
        this.originalImage = document.getElementById('originalImage');
        this.resultImage = document.getElementById('resultImage');
        this.largestTumor = document.getElementById('largestTumor');
        this.totalVolume = document.getElementById('totalVolume');
        this.avgConfidence = document.getElementById('avgConfidence');
        this.riskAssessment = document.getElementById('riskAssessment');
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        
        // Error elements
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
    }
    
    bindEvents() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Button events
        this.removeFileBtn.addEventListener('click', () => this.removeFile());
        this.analyzeBtn.addEventListener('click', () => this.analyzeImage());
        this.newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
        this.retryBtn.addEventListener('click', () => this.analyzeImage());
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }
    
    handleFileSelect(file) {
        if (!this.validateFile(file)) {
            return;
        }
        
        this.selectedFile = file;
        this.displayFileInfo(file);
        this.analyzeBtn.disabled = false;
        
        console.log('📁 File selected:', file.name);
    }
    
    validateFile(file) {
        const maxSize = 16 * 1024 * 1024; // 16MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
        
        if (file.size > maxSize) {
            this.showError('File too large. Maximum size is 16MB.');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showError('Invalid file type. Please use JPG, PNG, BMP, or TIFF files.');
            return false;
        }
        
        return true;
    }
    
    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'flex';
        this.uploadArea.style.display = 'none';
    }
    
    removeFile() {
        this.selectedFile = null;
        this.fileInfo.style.display = 'none';
        this.uploadArea.style.display = 'block';
        this.analyzeBtn.disabled = true;
        this.fileInput.value = '';
        
        console.log('🗑️ File removed');
    }
    
    async analyzeImage() {
        if (!this.selectedFile || this.isAnalyzing) {
            return;
        }
        
        this.isAnalyzing = true;
        this.showProgress();
        this.hideResults();
        this.hideError();
        
        try {
            console.log('🔬 Starting analysis...');
            
            // Create form data
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            
            // Update progress
            this.updateProgress(10, 'Uploading image...');
            
            // Send request
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            this.updateProgress(50, 'Running AI analysis...');
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Analysis failed');
            }
            
            this.updateProgress(90, 'Processing results...');
            
            // Small delay for smooth UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.updateProgress(100, 'Analysis complete!');
            
            // Show results after a brief delay
            setTimeout(() => {
                this.displayResults(result);
                this.hideProgress();
            }, 1000);
            
            console.log('✅ Analysis completed successfully');
            
        } catch (error) {
            console.error('❌ Analysis failed:', error);
            this.hideProgress();
            this.showError(error.message);
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    displayResults(result) {
        const data = result.data;
        const assessment = data.medical_assessment;
        
        // Store analysis data for print report
        this.lastAnalysisData = {
            ...data,
            medical_assessment: assessment,
            processing_time: data.processing_time,
            tumors_detected: data.tumors_detected,
            avg_confidence: assessment.avg_confidence,
            tumor_percentage: assessment.tumor_percentage,
            largest_tumor: assessment.largest_tumor_percentage,
            detections: data.detections || []
        };
        
        // Update medical summary
        this.tumorsCount.textContent = data.tumors_detected;
        this.tumorPercentage.textContent = `${assessment.tumor_percentage || 0}%`;
        this.confidenceLevel.textContent = assessment.confidence_interpretation || 'Unknown';
        this.processingTime.textContent = `${data.processing_time}s`;
        
        // Update criticality badge
        const criticalityLevel = assessment.criticality_level || 'UNKNOWN';
        const statusIcon = assessment.status_icon || '⚪';
        this.criticalityBadge.textContent = `${statusIcon} ${criticalityLevel}`;
        this.criticalityBadge.className = `criticality-badge ${criticalityLevel.toLowerCase().replace(' ', '')}`;
        
        // Update recommendation
        this.medicalRecommendation.textContent = assessment.medical_recommendation || 'No specific recommendation available.';
        
        // Update detailed metrics
        this.largestTumor.textContent = `${assessment.largest_tumor_percentage || 0}%`;
        this.totalVolume.textContent = `${assessment.estimated_volume_mm3 || 0} mm³`;
        this.avgConfidence.textContent = `${(assessment.average_confidence * 100 || 0).toFixed(1)}%`;
        this.riskAssessment.textContent = criticalityLevel;
        
        // Update images
        this.originalImage.src = result.images.original;
        this.resultImage.src = result.images.result;
        
        // Show results
        this.resultsSection.style.display = 'block';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showProgress() {
        this.progressSection.style.display = 'block';
        this.analyzeBtn.disabled = true;
        this.analyzeText.style.display = 'none';
        this.loadingSpinner.style.display = 'block';
    }
    
    hideProgress() {
        this.progressSection.style.display = 'none';
        this.analyzeBtn.disabled = false;
        this.analyzeText.style.display = 'block';
        this.loadingSpinner.style.display = 'none';
    }
    
    updateProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }
    
    showResults() {
        this.resultsSection.style.display = 'block';
    }
    
    hideResults() {
        this.resultsSection.style.display = 'none';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        this.errorSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideError() {
        this.errorSection.style.display = 'none';
    }
    
    /**
     * Generate printable medical report
     */
    generatePrintReport(analysisData) {
        try {
            // Prepare data for print report
            const reportData = {
                date: new Date().toLocaleString(),
                filename: this.selectedFile ? this.selectedFile.name : 'Unknown',
                process_time: analysisData.processing_time || 'N/A',
                tumors_detected: analysisData.tumors_detected || '0',
                confidence: analysisData.avg_confidence ? `${analysisData.avg_confidence}%` : 'N/A',
                largest_size: analysisData.largest_tumor ? `${analysisData.largest_tumor}%` : 'N/A',
                total_area: analysisData.tumor_percentage ? `${analysisData.tumor_percentage}%` : 'N/A',
                original_image: this.originalImage.src || '',
                result_image: this.resultImage.src || '',
                tumor_count: analysisData.tumors_detected || 0
            };
            
            // Add individual tumor data if available
            if (analysisData.detections && analysisData.detections.length > 0) {
                analysisData.detections.forEach((detection, index) => {
                    reportData[`tumor_${index}_size`] = `${(detection.area_percentage || 0).toFixed(2)}%`;
                    reportData[`tumor_${index}_confidence`] = `${(detection.confidence || 0).toFixed(1)}%`;
                    reportData[`tumor_${index}_location`] = `(${detection.x || 0}, ${detection.y || 0})`;
                    reportData[`tumor_${index}_assessment`] = detection.criticality || 'Under Review';
                });
            }
            
            // Build URL with parameters
            const params = new URLSearchParams(reportData);
            const printUrl = `/print-report?${params.toString()}`;
            
            // Open print report in new window
            const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');
            
            if (printWindow) {
                console.log('📄 Print report generated successfully');
                
                // Optional: Auto-print after content loads
                printWindow.onload = function() {
                    setTimeout(() => {
                        printWindow.print();
                    }, 1000);
                };
            } else {
                alert('Please allow pop-ups to generate the print report.');
            }
            
        } catch (error) {
            console.error('❌ Error generating print report:', error);
            alert('Failed to generate print report. Please try again.');
        }
    }
    
    resetAnalysis() {
        this.removeFile();
        this.hideResults();
        this.hideError();
        this.hideProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('🔄 Analysis reset');
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Global function to generate print report (callable from HTML)
function generatePrintReport() {
    const analyzer = window.brainAnalyzer;
    if (analyzer && analyzer.lastAnalysisData) {
        analyzer.generatePrintReport(analyzer.lastAnalysisData);
    } else {
        alert('No analysis data available for printing.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.brainAnalyzer = new BrainAnalyzer();
});