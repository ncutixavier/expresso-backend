const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(
    `SELECT * FROM Employee WHERE id = $employeeId`,
    { $employeeId: employeeId },
    (error, employee) => {
      if (error) {
        next(error);
      } else if (employee) {
        req.employee = employee;
        next();
      } else {
        res.status(404).send("Employee has not found!");
      }
    }
  );
});

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee', (err, employees) => {
    if (err) {
      next(err);
      return;
    }
    res.send({ employees });
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.send({ employee: req.employee });
});

employeesRouter.post('/', (req, res, next) => {
  const { name, position, wage } = req.body;
  const isCurrentEmployee = req.body.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    res.status(400).send('Missing required fields');
    return;
  }
  db.run(
    `INSERT INTO Employee (name, position, wage, is_current_employee)
    VALUES ($name, $position, $wage, $isCurrentEmployee)`,
    {
      $name: name,
      $position: position,
      $wage: wage,
      $isCurrentEmployee: isCurrentEmployee
    },
    function(error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = $id`,
          { $id: this.lastID },
          (error, employee) => {
            res.status(201).send({ employee });
          }
        );
      }
    }
  );
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const { name, position, wage } = req.body;
  const isCurrentEmployee = req.body.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    res.status(400).send('Missing required fields');
    return;
  }
  db.run(
    `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id`,
    {
      $name: name,
      $position: position,
      $wage: wage,
      $isCurrentEmployee: isCurrentEmployee,
      $id: req.employee.id
    },
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = $id`,
          { $id: req.employee.id },
          (error, employee) => {
            res.status(200).send({ employee });
          }
        );
      }
    }
  );
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(
    `DELETE FROM Employee WHERE id = $id`,
    { $id: req.employee.id },
    function (error) {
      if (error) {
        next(error);
      } else {
        res.status(204).send("Employee has deleted successful!");
      }
    }
  );
});

module.exports = employeesRouter;
