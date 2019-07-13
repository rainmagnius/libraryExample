'use strict';

const config = require('config');
const Koa = require('koa');
const qs = require('koa-qs');
const serve = require('koa-static');
const DBHelper = require('./util/dbhelper');
const AuthorController = require('./controller/author');
const BookController = require('./controller/book');
const BookRouter = require('./router/book');
const AuthorRouter = require('./router/author');

async function initApp() {
  const app = new Koa();
  qs(app);

  app.use(serve(config.static));

  const db = new DBHelper(config.database);

  const authorController = new AuthorController(db);
  await authorController.initTable();
  
  const authorRouter = AuthorRouter(authorController);
  app.use(authorRouter.routes());
  app.use(authorRouter.allowedMethods());

  const bookController = new BookController(db, config.static);
  await bookController.initTable();
  
  const bookRouter = BookRouter(bookController);
  app.use(bookRouter.routes());
  app.use(bookRouter.allowedMethods());

  app.listen(config.port, config.host);
  console.log(`Server is listening on: ${config.host}:${config.port}`);
}

initApp().catch(console.error);