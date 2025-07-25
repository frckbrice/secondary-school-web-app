import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import dotenv from 'dotenv';

dotenv.config();

// if (!process.env.DATABASE_PROD_URL) {
//   throw new Error('DATABASE_PROD_URL is not set');
// }

// const connectionString = process.env.DATABASE_PROD_URL;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export default db;
