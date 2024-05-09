const pg = require('pg');
const client = new pg.Client(
  process.env.DATABASE_URL || 'postgres://localhost/the_acme_store_workshop'
);

const uuid = require('uuid');
const bcrypt = require('bcrypt');

const createTables = async () => {
  const SQL = /* sql */ `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users(
      id uuid PRIMARY KEY,
      username VARCHAR(50),
      password VARCHAR(255)
    );

    CREATE TABLE products(
      id uuid PRIMARY KEY,
      name VARCHAR(50)
    );

    CREATE TABLE favorites(
      id uuid PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT favorite UNIQUE(product_id, user_id)
    );
  `;
  await client.query(SQL);
};

const createUser = async ({username, password}) => {
  const SQL = /* sql */ `
    INSERT INTO users(id, username, password)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
  return response.rows[0]
};

const createProduct = async ({name}) => {
  const SQL = /* sql */ `
    INSERT INTO products(id, name)
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = /* sql */ `
    SELECT * FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = /* sql */ `
    SELECT * FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createFavorite = async ({user_id, product_id,}) => {
  const SQL = /*sql*/ `
    INSERT INTO favorites(id, user_id, product_id)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

const fetchFavorites = async (id) => {
  const SQL = /* sql */ `
    SELECT * FROM favorites WHERE user_id = $1
  `;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

const destroyFavorite = async ({id, user_id}) => {
  const SQL = /* sql */ `
    DELETE FROM favorites WHERE id = $1 and user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
};