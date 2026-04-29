import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/modules/**/**.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false },
});
