const express = require('express');
const menuItems = require('./menuItems');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE id = $menuId';
  const values = { $menuId: menuId };
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.status(404).send('Menu has not found!');
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItems);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

menusRouter.post('/', (req, res, next) => {
  const { title } = req.body;
  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title: title,
  };

  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(
        'SELECT * FROM Menu WHERE id = $id',
        { $id: this.lastID },
        (error, menu) => {
          res.status(201).json({ menu: menu });
        }
      );
    }
  });
});

menusRouter.put('/:menuId', (req, res, next) => {
  const { title } = req.body;
  const sql = 'UPDATE Menu SET title = $title WHERE id = $id';
  const values = { $title: title, $id: req.menu.id };

  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(
        'SELECT * FROM Menu WHERE id = $id',
        { $id: req.menu.id },
        (error, menu) => {
          res.status(200).json({ menu: menu });
        }
      );
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  const sql = 'DELETE FROM Menu WHERE id = $id';
  const values = { $id: req.menu.id };

  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menusRouter;
