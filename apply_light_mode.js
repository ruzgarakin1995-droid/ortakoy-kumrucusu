const fs = require('fs');

const srcFile = 'c:/Users/egem2/Desktop/cati-ocakbasi/app/globals.css';
const destFile = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/app/globals.css';

const srcCode = fs.readFileSync(srcFile, 'utf8');
let destCode = fs.readFileSync(destFile, 'utf8');

// Extract body.light-mode block
const lightModeStart = srcCode.indexOf('body.light-mode {');
let lightModeEnd = srcCode.indexOf('}', lightModeStart) + 1;
const lightModeBlock = srcCode.substring(lightModeStart, lightModeEnd);

// Extract light mode refinements
const refinementsStart = srcCode.indexOf('/* LIGHT MODE UI REFINEMENTS */');
const nextSectionMatch = srcCode.substring(refinementsStart).match(/\n\/\*.*?\*\//g);
const nextSection = nextSectionMatch && nextSectionMatch.length > 1 ? nextSectionMatch[1] : null;
let refinementsEnd = nextSection ? srcCode.indexOf(nextSection, refinementsStart) : srcCode.indexOf('.search-bar input {', refinementsStart);
const refinementsBlock = srcCode.substring(refinementsStart, refinementsEnd);

let updated = false;

if (!destCode.includes('body.light-mode {')) {
  destCode = destCode.replace(':root {', lightModeBlock + '\n\n:root {');
  updated = true;
}

if (!destCode.includes('/* LIGHT MODE UI REFINEMENTS */')) {
  destCode += '\n\n' + refinementsBlock;
  updated = true;
}

if (updated) {
  fs.writeFileSync(destFile, destCode);
  console.log('light-mode CSS injected.');
} else {
  console.log('light-mode CSS already exists.');
}
