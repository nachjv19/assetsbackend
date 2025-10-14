import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller';
import { authMiddleware, isAdmin } from '../middlewares/auth.middlewares';

const router = Router();

router.get('/', getProducts);
router.post('/', authMiddleware, isAdmin, createProduct); // solo admin crea
router.patch('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

export default router;
