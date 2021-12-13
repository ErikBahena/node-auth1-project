const router = require("express").Router();
const bcrypt = require("bcryptjs");

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
    const { username, password } = req.body;

    const newUser = {
      username,
      password: bcrypt.hashSync(password, 10),
    };

    const created = await UsersModel.add(newUser);

    if (created)
      res
        .status(201)
        .json({ username: created.username, user_id: created.user_id });
    else next({ message: "could't register user" });
  }
);

router.post("/login", checkUsernameExists, (req, res, next) => {
  const { username, password } = req.body;
  // saves us from two trips to the database
  const userFromDb = req.user;

  const verified = bcrypt.compareSync(password, userFromDb.password);

  if (!verified) return next({ status: 401, message: "Invalid credentials" });
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

module.exports = router;
