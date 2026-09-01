const path = require('path');
const { splitManuscriptIntoChapters } = require(path.join(__dirname, '../src/lib/importer/documentParser.ts'));

const sampleManuscript = `
# The Beginning of the Journey

Chapter 1: The Awakening
The morning sun broke through the frosted glass of Kevin's small apartment in downtown Neo-Tokyo. 
He checked his system notifications and saw a strange blue icon pulsating.

Chapter 2: The Otaku Protocol
"Wait, what is this protocol?" Kevin muttered under his breath. 
He tapped the holographic interface and immediately received 500 spirit points.

Chapter 3: The Ice Queen Enters
The classroom went dead silent as Lady Seraphina entered through the sliding doors. 
Her silver hair caught the ambient light like spun moonlight.

Chapter 4: The Final Duel
The sword clashed against magical barriers with a thunderous resonance. 
`;

const result = splitManuscriptIntoChapters(sampleManuscript);
console.log("Chapters detected:", result.length);
result.forEach(c => {
  console.log(`- Chapter #${c.chapterNumber}: "${c.title}" (${c.wordCount} words)`);
});
