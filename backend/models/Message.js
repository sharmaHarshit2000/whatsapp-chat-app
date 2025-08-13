const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    wa_id: { type: String, required: true },
    name: { type: String },
    from: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    meta_msg_id: { type: String },
    text: { type: String },
    type: { type: String },
    timestamp: { type: Number },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "unknown"],
      default: "unknown",
    },
    conversation_id: { type: String },
    createdAtPayload: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MessageSchema.index({ wa_id: 1, timestamp: -1 });
module.exports = mongoose.model("Message", MessageSchema);
