import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Export it or add to .env.local');
  process.exit(1);
}

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`\n📦 Found ${files.length} migration files:\n`);
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
console.log('');

const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('✅ Connected to database\n');

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`⏳ Running: ${file} ...`);
    try {
      await client.query(sql);
      console.log(`   ✅ Done\n`);
    } catch (err) {
      // If it's a "already exists" error, that's fine — migration was already applied
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log(`   ⚠️  Skipped (already applied): ${err.message.split('\n')[0]}\n`);
      } else {
        console.error(`   ❌ Failed: ${err.message}\n`);
        throw err;
      }
    }
  }

  console.log('🎉 All migrations complete!\n');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
