const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const outputImage = document.getElementById('output-image');
const downloadLink = document.getElementById('download-link');
const outputSize = document.getElementById('output-size');
const roundness = document.getElementById('roundness');
const shadow = document.getElementById('shadow');
const imageSize = document.getElementById('image-size');
const gradientOptions = document.querySelectorAll('.gradient');
const output = document.getElementById('output');

let selectedGradient = 'light'; // Default gradient
let currentImage = null;

// Handle drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007bff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    const file = e.dataTransfer.files[0];
    processImage(file);
});

// Handle paste
document.addEventListener('paste', (e) => {
    const file = e.clipboardData.files[0];
    if (file) {
        processImage(file);
    }
});

// Handle file input click
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Handle file input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
});

// Process the image
function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            dropZone.classList.add('hidden'); // Hide drop zone
            output.style.display = 'block'; // Show preview
            updateCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Update canvas with current settings
function updateCanvas() {
    if (!currentImage) return;

    const padding = 50; // Padding size
    const aspectRatio = outputSize.value === 'square' ? 1 :
        outputSize.value === 'vertical' ? 4 / 5 : 5 / 4;
    const canvasWidth = 1080;
    const canvasHeight = canvasWidth / aspectRatio;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Draw gradient background
    const gradient = getGradient(ctx, canvasWidth, canvasHeight);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate image dimensions with padding and size adjustment
    const sizeRatio = imageSize.value / 100;
    const ratio = Math.min(
        (canvasWidth - padding * 2) / currentImage.width * sizeRatio,
        (canvasHeight - padding * 2) / currentImage.height * sizeRatio
    );
    const width = currentImage.width * ratio;
    const height = currentImage.height * ratio;
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2;

    // Draw the image with roundness
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, roundness.value);
    ctx.clip();
    ctx.drawImage(currentImage, x, y, width, height);
    ctx.restore();

    // Add shadow effect BEFORE drawing the image
    ctx.shadowColor = `rgba(0, 0, 0, ${shadow.value / 100})`;
    ctx.shadowBlur = shadow.value;  // Adjust shadow strength based on slider
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, roundness.value);
    ctx.fill(); // This makes sure the shadow is drawn
    ctx.clip();
    ctx.drawImage(currentImage, x, y, width, height);
    ctx.restore();

    // Convert canvas to image and display
    const dataUrl = canvas.toDataURL('image/png');
    outputImage.src = dataUrl;
    outputImage.style.maxWidth = '400px'; // Smaller preview size

    // Enable download link
    downloadLink.href = dataUrl;
    downloadLink.download = 'instagram-image.png';
}

// Get gradient based on selection
function getGradient(ctx, width, height) {
    const gradients = {
        light: ['#ff9a9e', '#fad0c4'],
        sunset: ['#ff6f61', '#ffcc00'],
        ocean: ['#00c6fb', '#005bea'],
        forest: ['#56ab2f', '#a8e063'],
        violet: ['#6a11cb', '#2575fc'],
        dark: ['#232526', '#414345']
    };
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, gradients[selectedGradient][0]);
    gradient.addColorStop(1, gradients[selectedGradient][1]);
    return gradient;
}

// Event listeners for adjustments
outputSize.addEventListener('change', updateCanvas);
roundness.addEventListener('input', updateCanvas);
shadow.addEventListener('input', updateCanvas);
imageSize.addEventListener('input', updateCanvas);
gradientOptions.forEach(option => {
    option.addEventListener('click', () => {
        selectedGradient = option.getAttribute('data-gradient');
        updateCanvas();
    });
});
