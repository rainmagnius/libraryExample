'use strict';

const config = require('config');
const Koa = require('koa');
const qs = require('koa-qs');
const bodyparser = require('koa-body');
const DBManager = require('./util/dbmanager');
const BookRouter = require('./router/book');
const AuthorRouter = require('./router/author');

async function initApp() {
  const app = new Koa();
  qs(app);
  
  app.use(bodyparser())

  const db = new DBManager(config.database);
  await db.init();

  const bookRouter = BookRouter(db);
  app.use(bookRouter.routes());
  app.use(bookRouter.allowedMethods());

  const authorRouter = AuthorRouter(db);
  app.use(authorRouter.routes());
  app.use(authorRouter.allowedMethods());

  app.listen(config.port, config.host);
  console.log(`Server is listening on: ${config.host}:${config.port}`);
}

initApp().catch(console.error);