const router = require("express").Router();
const bcrypt = require("bcryptjs");

const db = require("../../data/db-config");
const UsersModel = require("../users/users-model");

const {
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree,
} = require("./auth-middleware");

router.post(
  "/register",
  checkPasswordLength,
  checkUsernameFree,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const newUser = {
        username,
        password: bcrypt.hashSync(password, 10), // 2^8 rounds
      };

      const created = await UsersModel.add(newUser);

      res
        .status(201)
        .json({ username: created.username, user_id: created.user_id });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", checkUsernameExists, (req, res, next) => {
  const { username, password } = req.body;
  // saves us from two trips to the database
  const userFromDb = req.user;

  const verifies = bcrypt.compareSync(password, userFromDb.password);

  if (!verifies) return next({ status: 401, message: "Invalid credentials" });
  else {
    req.session.user = userFromDb;
    res.status(200).json({ message: `welcome ${username}!` });
  }
});

router.get("/logout", (req, res, next) => {
  req.session.user
    ? req.session.destroy((err) => {
        if (err) return next({ message: "cound't log you out" });

        res.status(200).json({ message: "logged out" });
      })
    : res.status(200).json({ message: "no session" });
});

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;
