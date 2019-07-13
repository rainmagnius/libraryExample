'use strict';

const Router = require('@koa/router');
const multer = require('@koa/multer');
const config = require('config');

function bookRouter(controller) {
  const router = new Router({ prefix: '/book'});
  const upload = multer({ dest: config.tmp,
    fileFilter: (req, file, cb) => {
      cb(null, file.mimetype.startsWith('image/'));
    },
  });

  router.get('/', async (ctx) => {
    ctx.body = await controller.getRows({ params: ctx.query });
  });

  router.post('/', upload.single('image'), async (ctx) => {
    const params = { ...ctx.request.body };
    if (ctx.request.file) params.image = ctx.request.file
    ctx.body = await controller.addRow({ params });
  });

  router.patch('/:id', upload.single('image'), async (ctx) => {
    const params = { ...ctx.request.body };
    if (ctx.request.file) params.image = ctx.request.file
    ctx.body = await controller.editRow({
      params,
      id: ctx.params.id,
    });
  });

  return router;
};

module.exports = bookRouter;
