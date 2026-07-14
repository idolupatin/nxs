// --- Canvas Dot Grid Animation (Anti-Crash Architecture) ---
const canvas = document.getElementById('dotGrid');
const ctx = canvas.getContext('2d');

const offscreenCanvas = document.createElement('canvas');
const offCtx = offscreenCanvas.getContext('2d');

const dotSpacing = 16; 
const maxDistance = 90; 
const dotRadius = 1.1;

// Color Configuration to match video exactly
const baseGray = 215; // Faint gray for static dots
const hoverGray = 40; // Dark gray/black for hovered dots

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    drawStaticGrid(); 
}

// SOP: Memory crash fix for WebKit/Safari engines
function drawStaticGrid() {
    offCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offCtx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`;
    
    for (let x = dotSpacing / 2; x < offscreenCanvas.width; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < offscreenCanvas.height; y += dotSpacing) {
            offCtx.beginPath(); // Open a separate path for each dot - prevents buffer crash
            offCtx.arc(x, y, dotRadius, 0, Math.PI * 2);
            offCtx.fill();      // Close and draw the dot immediately
        }
    }
}

window.addEventListener('resize', resizeCanvas);

let mouse = { x: -1000, y: -1000 };

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

resizeCanvas(); 

function animateGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);

    if (mouse.x > 0 && mouse.y > 0 && mouse.x < canvas.width && mouse.y < canvas.height) {
        const startX = Math.max(dotSpacing / 2, mouse.x - maxDistance - dotSpacing);
        const endX = Math.min(canvas.width, mouse.x + maxDistance + dotSpacing);
        const startY = Math.max(dotSpacing / 2, mouse.y - maxDistance - dotSpacing);
        const endY = Math.min(canvas.height, mouse.y + maxDistance + dotSpacing);

        const gridStartX = Math.floor(startX / dotSpacing) * dotSpacing + (dotSpacing / 2);
        const gridStartY = Math.floor(startY / dotSpacing) * dotSpacing + (dotSpacing / 2);

        for (let x = gridStartX; x <= endX; x += dotSpacing) {
            for (let y = gridStartY; y <= endY; y += dotSpacing) {
                const dx = mouse.x - x;
                const dy = mouse.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const ratio = 1 - (distance / maxDistance);
                    // Calculates transition from baseGray down to hoverGray
                    const gray = Math.floor(baseGray - (ratio * (baseGray - hoverGray))); 
                    
                    ctx.beginPath();
                    ctx.arc(x, y, dotRadius, 0, Math.PI * 2); 
                    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                    ctx.fill();
                }
            }
        }
    }
    
    requestAnimationFrame(animateGrid);
}
animateGrid();

// --- Typing Animation (Fault-Tolerant & Lazy Way) ---
document.addEventListener("DOMContentLoaded", () => {
    const typedSpan = document.getElementById('typedText');
    const untypedSpan = document.getElementById('untypedText');
    const cursorElement = document.getElementById('typingCursor');
    const ctaButtons = document.querySelector('.cta-buttons');
    
    // Smart execution stop: prevents crash if text HTML is missing/deleted
    if (!typedSpan || !untypedSpan) return;
    
    const originalText = untypedSpan.innerHTML;
    const tokens = originalText.match(/<[^>]+>|[\s\S]/g);
    let currentIndex = 0;
    
    typedSpan.innerHTML = '';
    
    setTimeout(() => {
        function typeWriter() {
            if (currentIndex < tokens.length) {
                typedSpan.innerHTML += tokens[currentIndex];
                currentIndex++;
                
                untypedSpan.innerHTML = tokens.slice(currentIndex).join('');
                
                let delay = (tokens[currentIndex - 1] && tokens[currentIndex - 1].startsWith('<')) ? 0 : 35; 
                setTimeout(typeWriter, delay);
            } else {
                setTimeout(() => {
                    if (ctaButtons) ctaButtons.classList.add('show-elements');
                    if (cursorElement) cursorElement.classList.add('hide'); 
                }, 400); 
            }
        }
        typeWriter();
    }, 2000);
});