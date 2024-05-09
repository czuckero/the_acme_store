const express = require('express');
const app = express();

const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
} = require('./db');

app.use(express.json());
app.use(require("morgan")("dev"));

app.get('/api/users', async(req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  };
});

app.get('/api/products', async(req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  };
});

app.get('/api/users/:id/favorites', async(req, res, send) => {
  try {
    res.send(await fetchFavorites(req.params.id))
  } catch (error) {
    next(error);
  };
});

app.post('/api/users/:id/favorites', async(req, res, send) => {
  try {
    res.status(201).send(await createFavorite({
      user_id: req.params.id,
      product_id: req.body.product_id
    }))
  } catch (error) {
    next(error);
  };
});

app.delete('/api/users/:user_id/favorites/:id', async(req, res, next) => {
  try {
    await destroyFavorite({
      id: req.params.id,
      user_id: req.params.user_id
    })
    res.sendStatus(204);
  } catch (error) {
    next(error);
  };
});

const init = async () => {
  await client.connect();

  await createTables();
  console.log('tables created');

  const [carmen, meredith, derek, milk, cabbage, cauliflower] =
  await Promise.all([
    createUser({username: 'carmen', password: 'barry30'}),
    createUser({username: 'meredith', password: 'gnome35'}),
    createUser({username: 'derek', password: 'feeb0'}),
    createProduct({name: 'milk'}),
    createProduct({name: 'cabbage'}),
    createProduct({name: 'cauliflower'}),
  ]);

  const users = await fetchUsers();
  console.log(users);
  const products = await fetchProducts();
  console.log(products);

  const userFavorites = await Promise.all([
    createFavorite({user_id: carmen.id, product_id: milk.id}),
    createFavorite({user_id: meredith.id, product_id: milk.id}),
    createFavorite({user_id: derek.id, product_id: cabbage.id}),
    createFavorite({user_id: derek.id, product_id: milk.id})
  ])

  console.log("derek's favs", await fetchFavorites(derek.id));

  // await deleteFavorite({id: userFavorites[0].id, user_id: carmen.id})

  console.log(`CURL -X POST localhost:3000/api/users/${derek.id}/favorites -d '{"product_id":"${cauliflower.id}"}' -H 'Content-Type:application/json'`);
  console.log(`CURL -X DELETE localhost:3000/api/users/${derek.id}/favorites/${userFavorites[2].id}`);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();