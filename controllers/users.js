const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/ValidationErr');
const ConflictErr = require('../errors/err-409');
const TokenErr = require('../errors/err-401');

const { NODE_ENV, JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      return res.send({
        name: user.name,
        email: user.email,
        _id: user._id,
      });
    })
    .catch(next);
};


const createUser = (req, res, next) => {
  const {
    email, password, name
  } = req.body;
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => {
      User.create({
        email, name, password: hash,
      })
        .then((user) => {
          res.status(201).send({
            name: user.name,
            email: user.email,
            _id: user._id,
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictErr('Пользователь с данным email уже существует'));
          } else if (err.name === 'ValidationError') {
            next(new ValidationError('Введены некорректные данные'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new TokenErr('Неправильные почта или пароль');
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

const updateUserProfile = (req, res, next) => {
  User.findOneAndUpdate(
    req.user._id,
    { name: req.body.name, email: req.body.email },
    { runValidators: true, new: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Введены некорректные данные'));
      } else {
        next(err);
      }
    });
};


module.exports = {
  getUser,
  createUser,
  updateUserProfile,
  login,
};
