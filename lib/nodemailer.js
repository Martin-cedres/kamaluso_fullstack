"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailOptions = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const email = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass,
    },
});
exports.mailOptions = {
    from: email,
    to: email, // Default to sending to your own email, can be overridden
};
