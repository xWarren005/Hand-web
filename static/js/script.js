// ════════════════════════════════════════════════════════════════
//  System State
// ════════════════════════════════════════════════════════════════
let isCameraActive = false;
let currentRecognizedLetter = '?';
let stream = null;
let predictionInterval = null;
let isRequestPending = false;
let frameCount = 0;
let fpsTimer = null;
let lastPrediction = null;
let toastTimeout = null;

// ════════════════════════════════════════════════════════════════
//  DOM Elements
// ════════════════════════════════════════════════════════════════
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const sidebarTriggerBtn = document.getElementById('sidebar-trigger-btn');
const resetBtn = document.getElementById('reset-btn');
const confirmBtn = document.getElementById('confirm-btn');
const backspaceBtn = document.getElementById('backspace-btn');
const spaceBtn = document.getElementById('space-btn');
const clearBtn = document.getElementById('clear-btn');
const copyTextBtn = document.getElementById('copy-text-btn');
const speakTextBtn = document.getElementById('speak-text-btn');
const vietnameseAlphabetList = document.getElementById('vietnamese-alphabet-list');

const cameraFeedBg = document.getElementById('camera-feed-bg');
const cameraPulseDot = document.getElementById('camera-pulse-dot');
const cameraStatusDot = document.getElementById('camera-status-dot');
const cameraStatusText = document.getElementById('camera-status-text');
const recognizedLetterBox = document.getElementById('recognized-letter-box');
const outputText = document.getElementById('output-text');
const fpsLabel = document.getElementById('fps-label');
const toastWrapper = document.getElementById('toast-wrapper');
const toastMessage = document.getElementById('toast-message');

const videoElement = document.getElementById('video-element');
const canvasElement = document.getElementById('canvas-element');
const cameraPlaceholderIcon = document.getElementById('camera-placeholder-icon');

// ════════════════════════════════════════════════════════════════
//  Toast
// ════════════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toastWrapper.className = 'custom-toast show';

    if (type === 'error') {
        toastWrapper.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        toastWrapper.style.color = '#ef4444';
    } else if (type === 'warn') {
        toastWrapper.style.borderColor = 'rgba(251, 191, 36, 0.5)';
        toastWrapper.style.color = '#fbbf24';
    } else {
        toastWrapper.style.borderColor = 'rgba(74, 225, 118, 0.4)';
        toastWrapper.style.color = '#4be277';
    }

    toastTimeout = setTimeout(() => {
        toastWrapper.classList.remove('show');
        toastTimeout = null;
    }, 3000);
}

// ════════════════════════════════════════════════════════════════
//  FPS Counter
// ════════════════════════════════════════════════════════════════
function startFpsCounter() {
    frameCount = 0;
    fpsTimer = setInterval(() => {
        fpsLabel.textContent = `${frameCount} FPS`;
        frameCount = 0;
    }, 1000);
}

function stopFpsCounter() {
    if (fpsTimer) {
        clearInterval(fpsTimer);
        fpsTimer = null;
    }
    fpsLabel.textContent = '0 FPS';
}

// ════════════════════════════════════════════════════════════════
//  Backend Prediction
// ════════════════════════════════════════════════════════════════
async function sendFrameToBackend() {
    if (!isCameraActive || !videoElement.videoWidth || isRequestPending) return;
    isRequestPending = true;

    const context = canvasElement.getContext('2d');
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasElement.toDataURL('image/jpeg', 0.75);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.prediction && result.prediction !== lastPrediction) {
                lastPrediction = result.prediction;
                currentRecognizedLetter = result.prediction;
                recognizedLetterBox.textContent = result.prediction;

                recognizedLetterBox.classList.add('scale-105');
                setTimeout(() => recognizedLetterBox.classList.remove('scale-105'), 150);
            }
            frameCount++; 
        }
    } catch (err) {
        console.error('Lỗi kết nối Backend:', err);
    } finally {
        isRequestPending = false; 
    }
}

// ════════════════════════════════════════════════════════════════
//  Camera Control
// ════════════════════════════════════════════════════════════════
async function setCameraState(active) {
    if (active === isCameraActive) return;

    if (active) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } }
            });
            videoElement.srcObject = stream;

            await new Promise(resolve => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve();
                };
            });

            isCameraActive = true;
            videoElement.classList.remove('hidden');
            cameraPlaceholderIcon.classList.add('hidden');
            cameraPulseDot.className = 'w-2.5 h-2.5 rounded-full bg-primary glow-green animate-pulse';
            cameraStatusDot.className = 'w-3 h-3 rounded-full bg-primary glow-green animate-pulse';
            cameraStatusText.textContent = 'HỆ THỐNG ĐANG HOẠT ĐỘNG';
            cameraStatusText.className = 'text-label-sm font-bold text-primary tracking-wide';

            predictionInterval = setInterval(sendFrameToBackend, 180);
            startFpsCounter();
            showToast('Đã kích hoạt Camera & hệ thống nhận diện');
        } catch (err) {
            isCameraActive = false;
            showToast('Lỗi truy cập Camera: ' + err.message, 'error');
        }
    } else {
        isCameraActive = false;
        if (predictionInterval) { clearInterval(predictionInterval); predictionInterval = null; }
        stopFpsCounter();
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        videoElement.srcObject = null;

        videoElement.classList.add('hidden');
        cameraPlaceholderIcon.classList.remove('hidden');
        cameraPulseDot.className = 'w-2.5 h-2.5 rounded-full bg-error glow-red animate-pulse';
        cameraStatusDot.className = 'w-3 h-3 rounded-full bg-error glow-red animate-pulse';
        cameraStatusText.textContent = 'HỆ THỐNG ĐÃ TẠM DỪNG';
        cameraStatusText.className = 'text-label-sm font-bold text-error tracking-wide';

        showToast('Đã tắt Camera', 'error');
    }
}

// ════════════════════════════════════════════════════════════════
//  Vietnamese Alphabet Logic
// ════════════════════════════════════════════════════════════════
const vietnameseVariants = {
    A: 'A Á À Ả Ã Ạ Ă Ắ Ằ Ẳ Ẵ Ặ Â Ấ Ầ Ẩ Ẫ Ậ',
    E: 'E É È Ẻ Ẽ Ẹ Ê Ế Ề Ể Ễ Ệ',
    I: 'I Í Ì Ỉ Ĩ Ị',
    O: 'O Ó Ò Ỏ Õ Ọ Ô Ố Ồ Ổ Ỗ Ộ Ơ Ớ Ờ Ở Ỡ Ợ',
    U: 'U Ú Ù Ủ Ũ Ụ Ư Ứ Ừ Ử Ữ Ự',
    Y: 'Y Ý Ỳ Ỷ Ỹ Ỵ',
    D: 'D Đ'
};

function addVietnameseLetter(letter) {
    if (!vietnameseAlphabetList) return;
    letter = letter.toUpperCase();

    // Xóa text placeholder mặc định nếu có
    const placeholder = vietnameseAlphabetList.querySelector('p');
    if (placeholder) {
        placeholder.remove();
    }

    // Tránh render lại nếu chữ cái đó đã được thêm vào bảng rồi
    if (document.getElementById(`letter-${letter}`)) {
        showToast(`Các biến thể của chữ ${letter} đã có sẵn trong bảng`, 'warn');
        return;
    }

    const card = document.createElement('div');
    card.className = 'bg-surface-container-highest/30 border border-outline-variant/40 p-3 rounded-lg';
    card.id = `letter-${letter}`;

    // Lấy chuỗi biến thể và tạo mảng
    const variantsStr = vietnameseVariants[letter] || letter;
    const variantsArray = variantsStr.split(' ');

    // Render từng biến thể dưới dạng Button
    let buttonsHTML = '';
    variantsArray.forEach(char => {
        buttonsHTML += `<button class="variant-btn bg-surface-container hover:bg-primary hover:text-on-primary-container text-on-surface text-lg font-bold border border-outline-variant/60 rounded px-3 py-1 m-1 transition-all shadow-sm hover:scale-105 active:scale-95" data-char="${char}">${char}</button>`;
    });

    card.innerHTML = `
        <div class="text-label-sm text-primary mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">abc</span>
            Biến thể của ${letter}
        </div>
        <div class="flex flex-wrap gap-1">
            ${buttonsHTML}
        </div>
    `;

    vietnameseAlphabetList.prepend(card);

    // Gắn sự kiện click cho từng nút biến thể vừa tạo
    const buttons = card.querySelectorAll('.variant-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const charToAdd = e.target.getAttribute('data-char');
            outputText.textContent += charToAdd;
            showToast(`Đã thêm chữ "${charToAdd}" vào văn bản`);
        });
    });
}

// ════════════════════════════════════════════════════════════════
//  Button Listeners
// ════════════════════════════════════════════════════════════════
startBtn.addEventListener('click', () => setCameraState(true));
if(sidebarTriggerBtn) sidebarTriggerBtn.addEventListener('click', () => setCameraState(true));
stopBtn.addEventListener('click', () => setCameraState(false));

// Bấm xác nhận => Đẩy vào Bảng chữ cái tiếng Việt thay vì Văn bản
confirmBtn.addEventListener('click', () => {
    if (!isCameraActive) {
        showToast('Vui lòng kích hoạt camera trước', 'error');
        return;
    }

    if (currentRecognizedLetter === '?') {
        showToast('Chưa nhận diện được ký tự nào', 'warn');
        return;
    }

    addVietnameseLetter(currentRecognizedLetter);
    showToast(`Đã thêm tập biến thể của ${currentRecognizedLetter} vào bảng`);
});

backspaceBtn.addEventListener('click', () => {
    const text = outputText.textContent;
    if (text.length > 0) {
        outputText.textContent = text.slice(0, -1);
    } else {
        showToast('Không có ký tự nào để xóa', 'warn');
    }
});

spaceBtn.addEventListener('click', () => {
    outputText.textContent += ' ';
});

clearBtn.addEventListener('click', () => {
    if (!outputText.textContent) {
        showToast('Văn bản đã trống', 'warn');
        return;
    }
    outputText.textContent = '';
    showToast('Đã xóa toàn bộ văn bản');
});

resetBtn.addEventListener('click', async () => {
    await setCameraState(false);
    outputText.textContent = '';
    if (vietnameseAlphabetList) {
        vietnameseAlphabetList.innerHTML = '<p class="text-on-surface-variant text-sm italic">Nhận diện và xác nhận để hiển thị chữ cái tại đây.</p>';
    }
    recognizedLetterBox.textContent = '?';
    currentRecognizedLetter = '?';
    lastPrediction = null;
    await setCameraState(true);
    showToast('Đã reset lại hệ thống');
});

copyTextBtn.addEventListener('click', () => {
    const text = outputText.textContent;
    if (!text.trim()) {
        showToast('Không có văn bản nào để sao chép', 'error');
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => showToast('Đã sao chép văn bản!'))
        .catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Đã sao chép văn bản!');
        });
});

// Chức năng Đọc Văn Bản (Text to Speech)
if (speakTextBtn) {
    speakTextBtn.addEventListener('click', () => {
        const text = outputText.textContent.trim();
        if (!text) {
            showToast('Không có văn bản để đọc', 'warn');
            return;
        }

        // Cancel bất kỳ giọng đọc nào đang phát trước đó
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN'; // Đọc tiếng việt
        utterance.rate = 1;
        utterance.pitch = 1;

        speechSynthesis.speak(utterance);
        showToast('Đang phát âm thanh...');
    });
}

// ════════════════════════════════════════════════════════════════
//  Keyboard Shortcuts
// ════════════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
        case 'Enter': confirmBtn.click(); break;
        case 'Backspace': backspaceBtn.click(); break;
    }
});