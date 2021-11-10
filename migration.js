const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS Employee (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        position TEXT NOT NULL,
        wage TEXT NOT NULL,
        is_current_employee INTEGER DEFAULT 1
        );
    `);
});