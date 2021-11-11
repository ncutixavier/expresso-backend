const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS Employee;`);
  db.run(`DROP TABLE IF EXISTS Timesheet;`);
  db.run(`DROP TABLE IF EXISTS Menu;`);
  db.run(`DROP TABLE IF EXISTS MenuItem;`);
});
