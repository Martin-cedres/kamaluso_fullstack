import mongoose, { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema({
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

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
