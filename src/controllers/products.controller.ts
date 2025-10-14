import { Request, Response } from 'express';
import ProductModel from '../models/Product';
import { logger } from '../utils/logger';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { brand, category } = req.query;
    const filter: any = {};
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    const prods = await ProductModel.find(filter).lean();
    logger.logHttp('GET', '/products', { filter, count: prods.length });
    res.json(prods);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { sku, name, price, quantity, brand, category, imageUrl } = req.body;
    if (!sku || !name) return res.status(400).json({ message: 'Missing sku or name' });

    const exists = await ProductModel.findOne({ sku });
    if (exists) return res.status(409).json({ message: 'SKU already exists' });

    if (price < 0 || quantity < 0) return res.status(400).json({ message: 'Negative numbers not allowed' });

    const product = await ProductModel.create({
      sku,
      name,
      price,
      quantity,
      brand,
      category,
      imageUrl
    });
    logger.logHttp('POST', '/products', { id: product._id, sku: product.sku });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.sku) {
      const other = await ProductModel.findOne({ sku: updates.sku, _id: { $ne: id } });
      if (other) return res.status(409).json({ message: 'SKU already in use' });
    }
    const updated = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
    logger.logHttp('PATCH', `/products/${id}`, { updated: !!updated });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = await ProductModel.findByIdAndDelete(id);
    logger.logHttp('DELETE', `/products/${id}`, { removed: !!removed });
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
