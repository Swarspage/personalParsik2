import "dotenv/config";
import { pool } from "./server/db.js";

async function run() {
  try {
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_requests text;');
    console.log("Successfully added special_requests column to orders table.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    process.exit(0);
  }
}

run();
