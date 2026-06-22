// backend/websocket/forumWsHandler.js
const jwt = require('jsonwebtoken');
const ForumMessage = require('../models/ForumMessage');
const User = require('../models/User');
require('dotenv').config();

// Broadcast to all connected clients via wss
function broadcast(wss, data, exclude = null) {
  const raw = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client !== exclude) {
      try { client.send(raw); } catch (e) {}
    }
  });
}

async function sendHistory(ws) {
  try {
    const docs = await ForumMessage.find({}).sort({ createdAt: -1 }).limit(100).lean();
    ws.send(JSON.stringify({ type: 'history', messages: docs.reverse() }));
  } catch (e) {
    console.error('sendHistory error', e);
  }
}

exports.handleConnection = (ws, req, wss) => {
  // attach state to ws
  ws.isAlive = true;
  ws.user = null; // will be set after auth

  ws.on('pong', () => { ws.isAlive = true; });

  // Ask client to authenticate
  ws.send(JSON.stringify({ type: 'auth_required' }));

  ws.on('message', async (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch (e) { return; }

    if (data.type === 'auth') {
      const token = data.token;
      if (!token) {
        // anonymous allowed to read only
        ws.user = null;
        await sendHistory(ws);
        broadcast(wss, { type: 'join' }, ws);
        return;
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          ws.send(JSON.stringify({ type: 'auth_failed' }));
          return;
        }
        ws.user = user;
        await sendHistory(ws);
        broadcast(wss, { type: 'join' }, ws);
      } catch (err) {
        console.warn('WS auth failed', err.message);
        ws.send(JSON.stringify({ type: 'auth_failed' }));
      }
      return;
    }

    if (data.type === 'message') {
      // require authentication to post
      if (!ws.user) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication required to send messages' }));
        return;
      }

      const content = String(data.content || '').slice(0, 1000);
      // strip tags very simply
      const safe = content.replace(/<[^>]*>/g, '');

      try {
        const saved = await ForumMessage.create({
          type: 'message',
          userId: ws.user._id,
          userName: ws.user.name || ws.user.email || 'Usuario',
          userRole: ws.user.role || 'estudiante',
          content: safe
        });
        // broadcast saved message to all (includes _id and createdAt)
        broadcast(wss, { type: 'message', message: saved });
      } catch (err) {
        console.error('Error saving message', err);
      }
      return;
    }

    if (data.type === 'question_of_day') {
      // only admin can publish
      if (!ws.user || ws.user.role !== 'admin') {
        ws.send(JSON.stringify({ type: 'error', message: 'Only admins can publish question of the day' }));
        return;
      }
      const content = String(data.content || '').slice(0, 1000).replace(/<[^>]*>/g, '');
      try {
        const saved = await ForumMessage.create({ type: 'question_of_day', userId: ws.user._id, userName: ws.user.name || 'Admin', userRole: 'admin', content });
        broadcast(wss, { type: 'question_of_day', message: saved });
      } catch (err) {
        console.error('Error saving question', err);
      }
      return;
    }

    if (data.type === 'typing') {
      // broadcast typing indicator to others
      broadcast(wss, { type: 'typing', userId: ws.user?._id || null, userName: ws.user?.name || 'Anon' }, ws);
      return;
    }
  });

  ws.on('close', () => {
    broadcast(wss, { type: 'leave' });
  });
};
