const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');

router.use('/', userRouter);
router.use('/movies', auth, movieRouter);
router.use(() => {
  throw new NotFoundError('Страница не найдена');
});

module.exports = router;
