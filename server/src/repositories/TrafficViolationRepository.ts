import { getDatabase } from '../database/database';
import { TrafficViolation, TrafficViolationWithContract, CreateTrafficViolationDTO } from '../models/TrafficViolation';

export class TrafficViolationRepository {
  findAll(): TrafficViolationWithContract[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT 
        tv.id,
        tv.contractId,
        tv.speed,
        tv.address,
        tv.createdAt,
        tv.updatedAt,
        c.name as contractName
      FROM traffic_violations tv
      INNER JOIN contracts c ON tv.contractId = c.id
      ORDER BY tv.createdAt DESC
    `).all();
    return rows as TrafficViolationWithContract[];
  }

  create(data: CreateTrafficViolationDTO): TrafficViolation {
    const db = getDatabase();
    const now = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO traffic_violations (contractId, speed, address, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.contractId, data.speed, data.address, now, now);

    const violation = db.prepare('SELECT * FROM traffic_violations WHERE id = ?').get(result.lastInsertRowid);
    return violation as TrafficViolation;
  }

  deleteById(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM traffic_violations WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
