const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

module.exports = (io) => {
  // primary webhook receiver (POST)
  router.post('/', async (req, res) => {
    try {
      const payload = req.body;

      // The sample payload structure
      const entries = payload?.metaData?.entry || [];
      const results = [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};

          // messages array 
          if (Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const contacts = value.contacts || [];
              const contact = contacts[0] || {};
              const wa_id = contact?.wa_id || (msg?.from ?? null);
              const name = contact?.profile?.name || null;

              const doc = {
                wa_id,
                name,
                from: msg.from,
                id: msg.id,
                meta_msg_id: msg.id,
                text: msg?.text?.body || '',
                type: msg.type || 'text',
                timestamp: Number(msg.timestamp) || Date.now(),
                status: 'sent' 
              };

              // upsert by id 
              const upserted = await Message.findOneAndUpdate(
                { id: doc.id },
                { $setOnInsert: doc },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              // notify via socket
              io.emit('new_message', upserted);

              results.push({ id: upserted.id, action: 'upserted' });
            }
          }

          // statuses array 
          if (Array.isArray(value.statuses)) {
            for (const st of value.statuses) {
              const targetId = st.meta_msg_id || st.id;
              const newStatus = st.status;
              const conversation = st.conversation?.id || null;

              const updated = await Message.findOneAndUpdate(
                { $or: [{ id: targetId }, { meta_msg_id: targetId }] },
                { $set: { status: newStatus, conversation_id: conversation } },
                { new: true }
              );

              if (updated) {
                io.emit('update_status', { id: targetId, status: newStatus });
                results.push({ id: targetId, action: 'status_updated', status: newStatus });
              } else {
                // status arrived before message
                const placeholder = await Message.create({
                  wa_id: st.recipient_id || 'unknown',
                  name: null,
                  from: st.recipient_id || 'unknown',
                  id: targetId,
                  meta_msg_id: targetId,
                  text: '',
                  timestamp: Number(st.timestamp) || Date.now(),
                  status: newStatus,
                  conversation_id: conversation
                });
                io.emit('new_message', placeholder);
                results.push({ id: targetId, action: 'placeholder_created', status: newStatus });
              }
            }
          }
        }
      }

      return res.status(200).json({ ok: true, results });
    } catch (err) {
      console.error('Webhook error', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};
