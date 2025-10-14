"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserStore_1 = require("../Stores/UserStore");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const userStore = new UserStore_1.UserStore();
const router = (0, express_1.Router)();
router.get('/', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, async (req, res) => {
    const users = await userStore.list();
    res.json(users);
});
router.post('/', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, async (req, res) => {
    const payload = req.body;
    const user = await userStore.create(payload);
    res.status(201).json(user);
});
router.patch('/:id', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, async (req, res) => {
    const updated = await userStore.update(req.params.id, req.body);
    if (!updated)
        return res.status(404).json({ message: 'Not found' });
    res.json(updated);
});
router.delete('/:id', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, async (req, res) => {
    const ok = await userStore.remove(req.params.id);
    if (!ok)
        return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'deleted' });
});
exports.default = router;
