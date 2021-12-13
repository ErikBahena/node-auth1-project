const db = require("../../data/db-config");

function restricted(req, res, next) {
  if (req.session.user) next();
  else next({ status: 401, message: "You shall not pass!" });
}

async function checkUsernameFree(req, res, next) {
  const foundUser = await db("users")
    .where("username", req.body.username)
    .first();

  if (foundUser) next({ status: 422, message: "Username taken" });
  else next();
}

async function checkUsernameExists(req, res, next) {
  const foundUser = await db("users")
    .where("username", req.body.username)
    .first();

  if (!foundUser) next({ status: 401, message: "Invalid credentials" });
  else {
    req.user = foundUser;
    next();
  }
}

function checkPasswordLength(req, res, next) {
  const { password } = req.body;

  if (!password || password.length <= 3)
    next({ status: 422, message: "Password must be longer than 3 chars" });
  else next();
}

module.exports = {
  restricted,
  checkPasswordLength,
  checkUsernameFree,
  checkUsernameExists,
};
