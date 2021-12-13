const db = require("../../data/db-config");

async function find() {
  return await db("users");
}

async function findBy(filter) {
  return await db("users").where(filter).first();
}

async function findById(user_id) {
  return await db("users").where({ user_id }).first();
}

async function add(user) {
  const [newUserId] = await db("users").insert(user);

  return findById(newUserId);
}

module.exports = { find, findBy, findById, add };
