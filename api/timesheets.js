const express = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(
    `SELECT * FROM Timesheet WHERE id = ${timesheetId} AND Timesheet.employee_id = ${req.params.employeeId}`,
    (error, timesheet) => {
      if (error) {
        next(error);
      } else if (timesheet) {
        req.timesheet = timesheet;
        next();
      } else {
        res.status(404).send('Timesheet has noot found');
      }
    }
  );
});

timesheetsRouter.get('/:timesheetId', (req, res, next) => {
  res.status(200).json({ timesheet: req.timesheet });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`,
    { $employeeId: req.params.employeeId },
    (error, timesheets) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({ timesheets: timesheets });
      }
    }
  );
});

timesheetsRouter.post('/', (req, res, next) => {
  const { hours, rate, date, notes } = req.body;
  const employeeId = req.params.employeeId;
  db.run(
    `INSERT INTO Timesheet (hours, rate, date, employee_id)
        VALUES ($hours, $rate, $date, $employeeId)`,
    {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId,
    },
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
          (error, timesheet) => {
            if (error) {
              next(error);
            } else {
              res.status(201).json({ timesheet });
            }
          }
        );
      }
    }
  );
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const { hours, rate, date } = req.body;
  db.run(
    `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date
            WHERE id = $timesheetId`,
    {
      $hours: hours,
      $rate: rate,
      $date: date,
      $timesheetId: req.timesheet.id,
    },
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${req.timesheet.id}`,
          (error, timesheet) => {
            if (error) {
              next(error);
            } else {
              res.status(200).json({ timesheet });
            }
          }
        );
      }
    }
  );
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(
        `DELETE FROM Timesheet WHERE id = $timesheetId`,
        { $timesheetId: req.timesheet.id },
        function (error) {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
        }
    );
});

module.exports = timesheetsRouter;
