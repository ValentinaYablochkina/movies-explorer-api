const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const TokenErr = require('../errors/err-401');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    validate: [validator.isEmail, 'Некорректный адрес почты'],
  },
  password: {
    type: String,
    require: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new TokenErr('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new TokenErr('Неправильные почта или пароль');
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
