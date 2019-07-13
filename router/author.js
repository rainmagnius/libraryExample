'use strict';

const Router = require('@koa/router');
const multer = require('@koa/multer');

function authorRouter(controller) {
  const router = new Router({ prefix: '/author'});
  const bodyparse = multer();

  router.get('/', async (ctx) => {
    ctx.body = await controller.getRows({ params: ctx.query});
  });

  router.post('/', bodyparse.none(), async (ctx) => {
    ctx.body = await controller.addRow({ params: ctx.request.body });
  });

  router.patch('/:id', bodyparse.none(), async (ctx) => {
    ctx.body = await controller.editRow({ id: ctx.params.id, params: ctx.request.body });
  });

  return router;
};

module.exports = authorRouter;
