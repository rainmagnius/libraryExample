'use strict';

const config = require('config');
const Koa = require('koa');
const mysql = require('mysql2');
const BookRouter = require('./router/book');
const AuthorRouter = require('./router/author');

const app = new Koa();

const bookRouter = BookRouter();
app.use(bookRouter.routes());
app.use(bookRouter.allowedMethods());

const authorRouter = AuthorRouter();
app.use(authorRouter.routes());
app.use(authorRouter.allowedMethods());

app.listen(config.port);
