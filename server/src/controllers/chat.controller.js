const { v4: uuidv4 } = require('uuid');
const ChatSession = require('../models/ChatSession');
const ollamaService = require('../services/ollama.service');

async function createSession(req, res, next) {
  try {
    const sessionId = uuidv4();
    const session = await ChatSession.create({
      sessionId,
      userId: req.user?.id || null,
      messages: [],
      metadata: { startedAt: new Date(), lastMessageAt: new Date() },
    });
    res.status(201).json({ sessionId: session.sessionId });
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({
      sessionId: session.sessionId,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add user message
    session.messages.push({ role: 'user', content: content.trim(), timestamp: new Date() });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullResponse = '';

    try {
      for await (const token of ollamaService.streamChat(session.messages)) {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    } catch (ollamaErr) {
      // If Ollama is not available, send a fallback message
      const fallback = "I'm sorry, the AI consultant is currently unavailable. Please try again later or browse our catalog for perfume recommendations.";
      fullResponse = fallback;
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Save assistant message
    session.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date() });
    session.metadata.lastMessageAt = new Date();
    await session.save();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    }
  }
}

async function listSessions(req, res, next) {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .sort({ 'metadata.lastMessageAt': -1 })
      .select('sessionId metadata messages')
      .limit(20);

    res.json({
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        startedAt: s.metadata.startedAt,
        lastMessageAt: s.metadata.lastMessageAt,
        messageCount: s.messages.length,
        preview: s.messages.find(m => m.role === 'user')?.content?.substring(0, 100) || '',
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, getSession, sendMessage, listSessions };
