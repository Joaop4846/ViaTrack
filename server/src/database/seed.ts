import { getDatabase } from './database';

const SEED_CONTRACTS = [
  'Engebras',
  'Via Sul Transportes',
  'Rodovia SP-101',
  'Concessionária Rota Norte',
  'TransBrasil Ltda',
];

export function seedDatabase(): void {
  const db = getDatabase();

  const count = db.prepare('SELECT COUNT(*) as count FROM contracts').get() as { count: number };

  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO contracts (name) VALUES (?)');

    const insertMany = db.transaction((contracts: string[]) => {
      for (const name of contracts) {
        insert.run(name);
      }
    });

    insertMany(SEED_CONTRACTS);
    console.log(`Seeded ${SEED_CONTRACTS.length} contracts`);
  }
}
