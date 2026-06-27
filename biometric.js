/* ============================================
   BIOMETRIC.JS - Camera & Fingerprint Capture
   ============================================ */

let videoStream = null;
let videoElement = null;

async function startCamera(videoElementId) {
    videoElement = document.getElementById(videoElementId);

    if (!videoElement) {
        showError('Video element not found!');
        return false;
    }

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        videoElement.srcObject = videoStream;
        await videoElement.play();

        return true;
    } catch (error) {
        console.error('Camera error:', error);
        showError('Camera access denied! Please allow camera permissions.');
        return false;
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    if (videoElement) {
        videoElement.srcObject = null;
    }
}

function capturePhoto(canvasElementId) {
    const canvas = document.getElementById(canvasElementId);

    if (!videoElement || !videoElement.videoWidth) {
        showError('Camera not started!');
        return null;
    }

    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg');
}

function capturePhotoToImage(imageElementId) {
    const img = document.getElementById(imageElementId);
    if (!img) {
        showError('Image element not found!');
        return null;
    }

    const photoData = capturePhoto();
    if (photoData) {
        img.src = photoData;
        img.style.display = 'block';
        return photoData;
    }

    return null;
}

function simulateFingerprint() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 200);

    for (let i = 0; i < 20; i++) {
        const x = 20 + i * 8 + Math.random() * 5;
        const y = 10 + i * 9;
        const width = 160 - Math.random() * 20;
        const height = 5 + Math.random() * 3;

        ctx.beginPath();
        ctx.ellipse(100 + (i - 10) * 3, 100 + (i - 10) * 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (i % 3 === 0) {
            ctx.beginPath();
            ctx.arc(60 + i * 4, 50 + i * 5, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#666';
            ctx.fill();
        }
    }

    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 10, 100, 20 + i * 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    return canvas.toDataURL('image/png');
}

function saveBiometric(voterId, photoData, fingerprintData) {
    const biometrics = {
        voterId: voterId,
        photo: photoData || null,
        fingerprint: fingerprintData || null,
        capturedAt: getCurrentDateTime()
    };

    localStorage.setItem('biometric_' + voterId, JSON.stringify(biometrics));
    addAuditLog('BIOMETRIC_CAPTURE', `Biometric data saved for ${voterId}`);

    return biometrics;
}

function getBiometric(voterId) {
    const data = localStorage.getItem('biometric_' + voterId);
    if (!data) return null;
    return JSON.parse(data);
}

function isCameraSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function getCameraStatus() {
    if (!isCameraSupported()) {
        return { available: false, message: 'Camera not supported on this device' };
    }
    return { available: true, message: 'Camera available' };
}