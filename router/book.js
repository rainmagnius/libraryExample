'use strict';

const Router = require('@koa/router');
const multer = require('@koa/multer');
const Cache = require('../middleware/cache');
const config = require('config');

function bookRouter(controller) {
  const router = new Router({ prefix: '/book'});
  const upload = multer({ dest: config.tmp,
    fileFilter: (req, file, cb) => {
      cb(null, file.mimetype.startsWith('image/'));
    },
  });
  const cache = new Cache(config.cache);
  const cachePrefix = 'book';

  router.get('/',
    cache.middleware(cachePrefix, ['id', 'title', 'date', 'author_id', 'description', 'order', 'limit', 'offset']),
    async (ctx) => {
      ctx.body = await controller.getRows({ params: ctx.query });
    }
  );

  router.post('/', upload.single('image'), async (ctx) => {
    const params = { ...ctx.request.body };
    if (ctx.request.file) params.image = ctx.request.file
    const result = await controller.addRow({ params });
    if (result) cache.clearCache(cachePrefix);
    ctx.body = result;
  });

  router.patch('/:id', upload.single('image'), async (ctx) => {
    const params = { ...ctx.request.body };
    if (ctx.request.file) params.image = ctx.request.file
    const result = await controller.editRow({ params, id: ctx.params.id });
    if (result) cache.clearCache(cachePrefix);
    ctx.body = result;
  });

  return router;
};

module.exports = bookRouter;
