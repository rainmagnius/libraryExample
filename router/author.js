'use strict';

const Router = require('@koa/router');

function authorRouter(db) {
  const router = new Router({ prefix: '/author'});

  router.get('/', async (ctx) => {
    ctx.body = await db.getAuthors(ctx.query);
  });

  router.post('/', async (ctx) => {
    ctx.body = await db.addAuthor({ ...ctx.request.body });
  });

  router.patch('/:id', async (ctx) => {
    ctx.body = await db.editAuthor({ id: ctx.params.id, ...ctx.request.body });
  });

  return router;
};

module.exports = authorRouter;
