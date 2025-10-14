import { Request, Response } from 'express';
import UserModel from '../models/User';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

// GET /users?role=admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    const users = await UserModel.find(filter).lean();
    logger.logHttp('GET', '/users', { filter, count: users.length });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /users
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    logger.logHttp('POST', '/users', { id: user._id, email: user.email });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.email) {
      const other = await UserModel.findOne({ email: updates.email, _id: { $ne: id } });
      if (other) return res.status(409).json({ message: 'Email already in use' });
    }

    const updated = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    logger.logHttp('PATCH', `/users/${id}`, { updated: !!updated });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = await UserModel.findByIdAndDelete(id);
    logger.logHttp('DELETE', `/users/${id}`, { removed: !!removed });
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
