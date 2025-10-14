"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ message: 'Missing fields' });
        const exists = await User_1.default.findOne({ $or: [{ username }, { email }] });
        if (exists)
            return res.status(409).json({ message: 'User or email already exists' });
        const salt = await bcrypt_1.default.genSalt(10);
        const hashed = await bcrypt_1.default.hash(password, salt);
        const user = await User_1.default.create({ username, email, password: hashed, role: 'user', createdAt: Date.now() });
        logger_1.logger.logHttp('POST', '/auth/register', { id: user._id, username: user.username });
        res.status(201).json({ message: 'User created', id: user._id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        if (!usernameOrEmail || !password)
            return res.status(400).json({ message: 'Missing fields' });
        const user = await User_1.default.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: 'Invalid credentials' });
        // jsonwebtoken v9 has stricter typings; cast secret to Unknown to satisfy overloads
        const payload = { id: user._id.toString(), username: user.username, role: user.role };
        const options = { expiresIn: JWT_EXPIRES_IN };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
        logger_1.logger.logHttp('POST', '/auth/login', { id: user._id, username: user.username });
        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
