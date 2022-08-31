const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const AuthorizedButForbidden = require('../errors/err-403');
const ValidationError = require('../errors/ValidationErr');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Введены некорректные данные'));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Передан несуществующий id фильма');
      }
      if (String(movie.owner) !== req.user._id) {
        throw new AuthorizedButForbidden('Нарушение прав доступа');
      } else {
        movie.remove()
          .then(() => {
            res.send({ message: 'Фильм удалена' });
          })
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Введены некорректные данные'));
      } else {
        next(err);
      }
    });
};



module.exports = {
  getMovies, createMovie, deleteMovie,
};
