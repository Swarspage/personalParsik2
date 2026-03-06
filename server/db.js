import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";
const { Pool } = pg;
let pool;
let db;
if (process.env.DATABASE_URL) {
  console.log("[Database] Initializing connection pool...");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.log("[Database] No DATABASE_URL found in environment.");
}
export {
  db,
  pool
};
