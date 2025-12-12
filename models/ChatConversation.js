"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversation = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    role: { type: String, required: true, enum: ['user', 'model', 'system'] },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const ChatConversationSchema = new mongoose_1.Schema({
    messages: [MessageSchema],
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    deviceInfo: { type: String }, // User Agent or similar
    status: { type: String, default: 'active', enum: ['active', 'closed'] },
    metadata: { type: Object } // Future proofing
}, {
    timestamps: true,
});
exports.ChatConversation = mongoose_1.models.ChatConversation || (0, mongoose_1.model)('ChatConversation', ChatConversationSchema);
