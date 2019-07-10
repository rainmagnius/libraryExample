'use strict';

const Router = require('@koa/router');

function bookRouter() {
  const router = new Router({ prefix: '/book'});

  router.get('/', async (ctx) => {
    ctx.body = "get book";
  });

  router.post('/', async (ctx) => {
    ctx.body = "add book";
  });

  router.patch('/:id', async (ctx) => {
    ctx.body = "edit book";
  });

  return router;
};

module.exports = bookRouter;
