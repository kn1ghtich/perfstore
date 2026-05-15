/**
 * knowledge.service.js
 * RAG helper — loads the perfume knowledge article, splits it into ~250-word
 * chunks and finds the most relevant ones for a given user message.
 */

const fs   = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(__dirname, '../data/perfume_knowledge.txt');
const CHUNK_WORD_LIMIT = 250;

let _chunks = null; // lazy cache

// ─── Split article into chunks ────────────────────────────────────────────────
function _buildChunks() {
  if (_chunks) return _chunks;

  const text = fs.readFileSync(KNOWLEDGE_PATH, 'utf-8');

  // Split on blank lines (paragraph boundaries)
  const paragraphs = text.split(/\n{2,}/);

  const result = [];
  let current  = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const combined  = current ? current + '\n\n' + trimmed : trimmed;
    const wordCount = combined.split(/\s+/).length;

    if (wordCount > CHUNK_WORD_LIMIT && current) {
      result.push(current.trim());
      current = trimmed;
    } else {
      current = combined;
    }
  }

  if (current.trim()) result.push(current.trim());

  _chunks = result;
  return _chunks;
}

// ─── Find relevant chunks ─────────────────────────────────────────────────────
/**
 * Returns the top `topN` chunks from the knowledge article that are most
 * relevant to the user's message, based on keyword overlap.
 *
 * @param {string} userMessage
 * @param {number} topN        – max chunks to return (default 2)
 * @returns {string[]}
 */
function findRelevantChunks(userMessage, topN = 2) {
  const allChunks = _buildChunks();

  // Extract meaningful words (>3 chars) from user message
  const words = userMessage
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  if (words.length === 0) return [];

  const scored = allChunks.map((chunk) => {
    const cl = chunk.toLowerCase();
    const score = words.reduce((acc, w) => acc + (cl.includes(w) ? 1 : 0), 0);
    return { chunk, score };
  });

  // Sort descending; only return chunks with at least one keyword match
  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .slice(0, topN)
    .map((s) => s.chunk);
}

module.exports = { findRelevantChunks };
