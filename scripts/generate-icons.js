const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

// Modern, high-end Padel App Icon SVG
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="ballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>

  <!-- Subtle Court Lines Ambient Glow -->
  <rect x="56" y="56" width="400" height="400" rx="40" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.25"/>
  <line x1="56" y1="256" x2="456" y2="256" stroke="#ffffff" stroke-width="3" stroke-opacity="0.25"/>
  <line x1="256" y1="56" x2="256" y2="456" stroke="#ffffff" stroke-width="3" stroke-opacity="0.25"/>

  <!-- Padel Racket -->
  <g filter="url(#shadow)" transform="rotate(-25 240 240)">
    <!-- Racket Head -->
    <ellipse cx="230" cy="200" rx="110" ry="125" fill="#ffffff"/>
    <ellipse cx="230" cy="200" rx="96" ry="110" fill="#0f172a"/>

    <!-- Padel Perforation Holes (Grid of holes in diamond pattern) -->
    <g fill="#38bdf8">
      <circle cx="230" cy="155" r="7"/>
      <circle cx="200" cy="175" r="7"/>
      <circle cx="230" cy="175" r="7"/>
      <circle cx="260" cy="175" r="7"/>
      <circle cx="175" cy="200" r="7"/>
      <circle cx="205" cy="200" r="7"/>
      <circle cx="230" cy="200" r="7"/>
      <circle cx="255" cy="200" r="7"/>
      <circle cx="285" cy="200" r="7"/>
      <circle cx="200" cy="225" r="7"/>
      <circle cx="230" cy="225" r="7"/>
      <circle cx="260" cy="225" r="7"/>
      <circle cx="230" cy="245" r="7"/>
    </g>

    <!-- Racket Throat -->
    <path d="M190 310 L230 335 L270 310 Z" fill="#ffffff"/>

    <!-- Racket Handle -->
    <rect x="216" y="330" width="28" height="95" rx="6" fill="#ffffff"/>
    <line x1="216" y1="355" x2="244" y2="350" stroke="#cbd5e1" stroke-width="3"/>
    <line x1="216" y1="375" x2="244" y2="370" stroke="#cbd5e1" stroke-width="3"/>
    <line x1="216" y1="395" x2="244" y2="390" stroke="#cbd5e1" stroke-width="3"/>
    <!-- Handle Butt Cap -->
    <rect x="212" y="420" width="36" height="12" rx="4" fill="#0f172a"/>
  </g>

  <!-- Padel Ball (Neon Yellow with classic seam) -->
  <g filter="url(#shadow)">
    <circle cx="370" cy="340" r="54" fill="url(#ballGrad)"/>
    <!-- Curved Seam -->
    <path d="M335 315 C 365 330, 365 370, 395 385" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-opacity="0.85"/>
  </g>
</svg>
`;

// Save base SVG
const svgPath = path.join(publicIconsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon, 'utf8');
console.log('Saved icon.svg');

async function generatePngs() {
  const buffer = Buffer.from(svgIcon);

  // 192x192
  await sharp(buffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 512x512
  await sharp(buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // Maskable icon 512x512 (with padding for Android adaptive icons)
  await sharp(buffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 37, g: 99, b: 235, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicIconsDir, 'icon-maskable-512.png'));
  console.log('Generated icon-maskable-512.png');

  // Apple touch icon 180x180
  await sharp(buffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicIconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon 32x32
  await sharp(buffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicIconsDir, 'favicon-32.png'));
  console.log('Generated favicon-32.png');
}

generatePngs().catch(console.error);
