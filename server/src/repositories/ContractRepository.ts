import { getDatabase } from '../database/database';
import { Contract } from '../models/Contract';

export class ContractRepository {
  findAll(): Contract[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT id, name, createdAt, updatedAt FROM contracts ORDER BY name').all();
    return rows as Contract[];
  }

  findById(id: number): Contract | undefined {
    const db = getDatabase();
    const row = db.prepare('SELECT id, name, createdAt, updatedAt FROM contracts WHERE id = ?').get(id);
    return row as Contract | undefined;
  }
}
