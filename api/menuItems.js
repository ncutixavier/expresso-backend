const express = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql =
    'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId AND menu_id = $menuId';
  const values = { $menuItemId: menuItemId, $menuId: req.params.menuId };
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.status(404).send("Menu Item has not found!");
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (error, menuItems) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({ menuItems: menuItems });
      }
    }
  );
});

menuItemsRouter.post('/', (req, res, next) => {
  const { name, description, inventory, price } = req.body;
  if (!name || !description || !inventory || !price) {
    res.status(400).json({ error: 'Missing required field(s)' });
  } else {
    db.run(
      `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
        VALUES ($name, $description, $inventory, $price, $menuId)`,
      {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          let menuItem = req.body;
          menuItem = Object.assign({ id: this.lastID }, menuItem);
          res.status(201).json({ menuItem });
        }
      }
    );
  }
});

menuItemsRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).json({ menuItem: req.menuItem });  
})

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const { name, description, inventory, price } = req.body;
  if (!name || !description || !inventory || !price) {
    res.status(400).json({ error: 'Missing required field(s)' });
  } else {
    db.run(
      `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId`,
      {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.menuItem.id,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          let menuItem = req.body;
          menuItem = Object.assign({ id: req.menuItem.id }, menuItem);
          res.status(200).json({ menuItem });
        }
      }
    );
  }
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(
    `DELETE FROM MenuItem WHERE id = $menuItemId`,
    { $menuItemId: req.menuItem.id },
    function (error) {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = menuItemsRouter;
