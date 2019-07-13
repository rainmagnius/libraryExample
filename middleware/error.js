'use strict';

function errorMiddleware(){
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error(err);
      ctx.body = "Something has gone wrong, please check your data and try again";
    };
  }
}

module.exports = errorMiddleware;