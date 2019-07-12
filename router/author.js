'use strict';

const Router = require('@koa/router');

function authorRouter(controller) {
  const router = new Router({ prefix: '/author'});

  router.get('/', async (ctx) => {
    ctx.body = await controller.getRows({ params: ctx.query});
  });

  router.post('/', async (ctx) => {
    ctx.body = await controller.addRow({ params: ctx.request.body });
  });

  router.patch('/:id', async (ctx) => {
    ctx.body = await controller.editRow({ id: ctx.params.id, params: ctx.request.body });
  });

  return router;
};

module.exports = authorRouter;
