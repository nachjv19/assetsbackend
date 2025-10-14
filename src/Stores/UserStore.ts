import UserModel, { IUser } from '../models/User';
import { defaultPropsCreate } from '../utils/decorators';
import { logger } from '../utils/logger';

// Clase que expone los CRUD: list, findByName, create, update, remove
export class UserStore {
  // lista todos los usuarios
  async list(): Promise<IUser[]> {
    const users = await UserModel.find().lean();
    logger.logHttp('GET', '/users', { resultCount: users.length });
    return users;
  }

  async findByName(username: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ username }).lean();
    logger.logHttp('GET', `/users?username=${username}`, { found: !!user });
    return user;
  }

  @defaultPropsCreate({ role: 'user', createdAt: Date.now(), isActive: true })
  async create(payload: Partial<IUser>): Promise<IUser> {
    // payload ya tiene role y createdAt gracias al decorador
    const created = await UserModel.create(payload);
    logger.logHttp('POST', '/users', { id: created._id, username: created.username });
    return created;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const updated = await UserModel.findByIdAndUpdate(id, data, { new: true });
    logger.logHttp('PATCH', `/users/${id}`, { updated: !!updated });
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const res = await UserModel.findByIdAndDelete(id);
    logger.logHttp('DELETE', `/users/${id}`, { deleted: !!res });
    return !!res;
  }
}
