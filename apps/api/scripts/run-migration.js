const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected. Running migration...');

  await client.query(
    `ALTER TABLE "patient_case" ALTER COLUMN "clinic_description" DROP NOT NULL`,
  );

  console.log('Migration complete: clinic_description is now nullable.');
  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
