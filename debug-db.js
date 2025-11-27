const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

try {
  const db = new Database('fitness.db');
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  console.log('Executing schema...');
  db.exec(schema);
  console.log('Schema executed successfully.');
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables);
  
} catch (error) {
  console.error('Error executing schema:', error);
}
