import { Router } from 'express';
import { UserStore } from '../Stores/UserStore';
import { authMiddleware, isAdmin } from '../middlewares/auth.middlewares';

const userStore = new UserStore();
const router = Router();

router.get('/', authMiddleware, isAdmin, async (req, res) => {
  const users = await userStore.list();
  res.json(users);
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
  const payload = req.body;
  const user = await userStore.create(payload);
  res.status(201).json(user);
});

router.patch('/:id', authMiddleware, isAdmin, async (req, res) => {
  const updated = await userStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  const ok = await userStore.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'deleted' });
});

export default router;
