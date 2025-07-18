const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size, size);
    
    // Star
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.35;
    const innerRadius = size * 0.15;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    
    return canvas.toBuffer('image/png');
}

// Generate icons for all required sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
    const buffer = generateIcon(size);
    const filename = `icons/icon${size}.png`;
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Generated ${filename}`);
});

console.log('🎉 All icons generated successfully!'); 