const router = require("express").Router();

const UsersModel = require("./users-model");

const { restricted } = require("../auth/auth-middleware");

router.get("/", restricted, (req, res, next) => {
  UsersModel.find()
    .then((users) => res.status(200).json(users))
    .catch(next);
});

module.exports = router;
