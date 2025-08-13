const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// get all conversations grouped by wa_id 
router.get("/", async (req, res) => {
  const agg = await Message.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$wa_id",
        wa_id: { $first: "$wa_id" },
        name: { $first: "$name" },
        last_message: { $first: "$text" },
        last_timestamp: { $first: "$timestamp" },
      },
    },
    { $sort: { last_timestamp: -1 } },
  ]);
  res.json(agg);
});

// get messages for a conversation
router.get("/:wa_id/messages", async (req, res) => {
  const { wa_id } = req.params;
  const msgs = await Message.find({ wa_id }).sort({ timestamp: 1 });
  res.json(msgs);
});

// demo send message 
module.exports = (io) => {
  router.post("/:wa_id/send", async (req, res) => {
    try {
      const { wa_id } = req.params;
      const { text, from = process.env.BUSINESS_NUMBER || "918329446654" } =
        req.body;
      const id = `local-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      // Get existing name 
      const existingMessage = await Message.findOne({ wa_id }).sort({
        timestamp: -1,
      });
      const existingName = existingMessage?.name || null;

      const doc = await Message.create({
        wa_id,
        name: existingName, 
        from,
        id,
        meta_msg_id: id,
        text,
        type: "text",
        timestamp: Date.now(),
        status: "sent",
      });

      io.emit("new_message", doc);
      res.json({ ok: true, message: doc });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};
