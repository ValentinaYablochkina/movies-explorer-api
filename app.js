const express = require('express');
const helmet = require('helmet');

const { PORT = 3000 } = process.env;
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const router = require('./routes');
const errorHandler = require('./middlewares/errorhandler');
const { errorLogger, requestLogger } = require('./middlewares/logger');
const { limiter } = require('./middlewares/rateLimit');

const { NODE_ENV, mongoServer } = process.env;

const app = express();

app.use(helmet());
app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);
app.use(errorLogger);
app.use(requestLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect(NODE_ENV === 'production' ? mongoServer : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
