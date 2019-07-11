'use strict';

const Router = require('@koa/router');

function bookRouter(db) {
  const router = new Router({ prefix: '/book'});

  router.get('/', async (ctx) => {
    ctx.body = await db.getBooks(ctx.query);
  });

  router.post('/', async (ctx) => {
    ctx.body = await db.addBook({ ...ctx.request.body });
  });

  router.patch('/:id', async (ctx) => {
    ctx.body = await db.editBook({ id: ctx.params.id, ...ctx.request.body });
  });

  return router;
};

module.exports = bookRouter;
