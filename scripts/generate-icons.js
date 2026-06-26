#!/usr/bin/env node
/**
 * Run this script to generate PWA icons:
 * node scripts/generate-icons.js
 * Requires: npm install canvas
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#003087';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  // S diamond emblem (simplified)
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  ctx.fillStyle = '#E31837';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();

  // White S
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx + size * 0.04, cy - size * 0.09, size * 0.13, Math.PI * 0.1, Math.PI * 1.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - size * 0.04, cy + size * 0.09, size * 0.13, Math.PI * 1.1, Math.PI * 0.1);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: icon-${size}x${size}.png`);
});

console.log('Icons generated successfully!');
