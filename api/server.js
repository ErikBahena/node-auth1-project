const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const Store = require("connect-session-knex")(session);

const usersRouter = require("./users/users-router");
const authRouter = require("./auth/auth-router");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(
  session({
    name: "chocolatechip",
    secret: process.env.SESSION_SECRET || "keep it secret, keep it safe",
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false, // secure true means, the session only works on https
      httpOnly: false, // httpOnly true means the JavaScript cannot read cookie
    },
    resave: false, // not important
    saveUninitialized: false, // sessions false don't get stored on the server by default, we have to "cause it" to happen in the code GDPR
    rolling: true, // pushed back logout date
    store: new Store({
      knex: require("../data/db-config"),
      tablename: "sessions",
      sidfieldname: "sid",
      createtable: true,
      clearInterval: 1000 * 60 * 60,
    }),
  })
);

server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter);

server.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
