'use strict';

const Router = require('@koa/router');

function authorRouter() {
  const router = new Router({ prefix: '/author'});

  router.get('/', async (ctx) => {
    ctx.body = "get author";
  });

  router.post('/', async (ctx) => {
    ctx.body = "add author";
  });

  router.patch('/:id', async (ctx) => {
    ctx.body = "edit author";
  });

  return router;
};

module.exports = authorRouter;
