const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS Employee (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            wage TEXT NOT NULL,
            is_current_employee INTEGER DEFAULT 1
        );
    `);
  db.run(`
        CREATE TABLE IF NOT EXISTS Timesheet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hours INTEGER NOT NULL,
            rate INTEGER NOT NULL,
            date TEXT NOT NULL,
            employee_id INTEGER NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES Employee(id)
        );
    `);
});
