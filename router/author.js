'use strict';

const Router = require('@koa/router');
const multer = require('@koa/multer');
const Cache = require('../middleware/cache');
const config = require('config');

function authorRouter(controller) {
  const router = new Router({ prefix: '/author'});
  const bodyparse = multer();
  const cache = new Cache(config.cache);
  const cachePrefix = 'author';

  router.get('/', 
    cache.middleware(cachePrefix, ['id', 'firstname', 'secondname', 'order', 'limit', 'offset']),
    async (ctx) => {
      ctx.body = await controller.getRows({ params: ctx.query});
    }
  );

  router.post('/', bodyparse.none(), async (ctx) => {
    const result = await controller.addRow({ params: ctx.request.body });
    if (result) cache.clearCache(cachePrefix);
    ctx.body = result;
  });

  router.patch('/:id', bodyparse.none(), async (ctx) => {
    const result =  await controller.editRow({ id: ctx.params.id, params: ctx.request.body });
    if (result) cache.clearCache(cachePrefix);
    ctx.body = result;
  });

  return router;
};

module.exports = authorRouter;
