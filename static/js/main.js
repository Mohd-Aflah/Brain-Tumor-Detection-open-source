/**
 * Brain Tumor Analysis System v1.0 - Main JavaScript
 * ===================================================
 * 
 * Handles home page functionality and system status monitoring
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧠 Brain Tumor Analysis System v1.0 initialized');
    
    // Check system status
    checkSystemStatus();
    
    // Update status every 30 seconds
    setInterval(checkSystemStatus, 30000);
});

/**
 * Check and display system status
 */
async function checkSystemStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        updateStatusDisplay(data);
        
    } catch (error) {
        console.error('❌ Failed to check system status:', error);
        updateStatusDisplay({
            status: 'error',
            ai_available: false,
            model_loaded: false,
            device: 'unknown'
        });
    }
}

/**
 * Update status display elements
 */
function updateStatusDisplay(data) {
    const systemStatus = document.getElementById('systemStatus');
    const modelStatus = document.getElementById('modelStatus');
    const deviceStatus = document.getElementById('deviceStatus');
    
    if (systemStatus) {
        if (data.status === 'operational') {
            systemStatus.innerHTML = '<span style="color: var(--medical-green);">●</span> Operational';
        } else {
            systemStatus.innerHTML = '<span style="color: var(--medical-red);">●</span> Error';
        }
    }
    
    if (modelStatus) {
        if (data.ai_available && data.model_loaded) {
            modelStatus.innerHTML = '<span style="color: var(--medical-green);">●</span> Ready';
        } else if (data.ai_available) {
            modelStatus.innerHTML = '<span style="color: var(--medical-yellow);">●</span> Loading';
        } else {
            modelStatus.innerHTML = '<span style="color: var(--medical-red);">●</span> Not Available';
        }
    }
    
    if (deviceStatus) {
        const deviceColor = data.device === 'cuda' ? 'var(--medical-green)' : 'var(--primary-blue)';
        const deviceText = data.device === 'cuda' ? 'GPU' : 'CPU';
        deviceStatus.innerHTML = `<span style="color: ${deviceColor};">●</span> ${deviceText}`;
    }
}

/**
 * Utility function to format file sizes
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--medical-red)' : type === 'success' ? 'var(--medical-green)' : 'var(--primary-blue)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .notification button:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(style);