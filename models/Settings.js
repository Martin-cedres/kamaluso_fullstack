"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SettingsSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true, default: 'global' },
    topBar: {
        enabled: { type: Boolean, default: false },
        text: { type: String, default: '' },
        link: { type: String, default: '' },
        couponCode: { type: String, default: '' },
        backgroundColor: { type: String, default: '#000000' },
        textColor: { type: String, default: '#ffffff' }
    }
}, { timestamps: true });
const Settings = mongoose_1.models.Settings || (0, mongoose_1.model)('Settings', SettingsSchema);
exports.default = Settings;
