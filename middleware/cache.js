'use strict';
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const crypto = require('crypto');
const rimraf = require('rimraf');

/**
 * Filecache middleware for Koa
 *
 * @class CacheMiddleware
 */
class CacheMiddleware {
  /**
   * Creates an instance of CacheMiddleware.
   * @param {string} cacheFolder path to cacheFolder
   * @param {number} [ttl = 60000] time to live in milliseconds
   * @memberof CacheMiddleware
   */
  constructor({ cacheFolder, ttl = 60 * 1000 }) {
    this.cacheFolder = cacheFolder;
    this.ttl = ttl;
    if (!fs.existsSync(cacheFolder))
      fs.mkdirSync(cacheFolder);
  }

  /**
   * return koa middleware
   *
   * @param {string} prefix cache prefix
   * @param {Array<string>} keys cache depends of 
   * @param {number} [ttl] time to live
   * @returns
   * @memberof CacheMiddleware
   */
  middleware(prefix, keys, ttl) {
    if (!ttl) ttl = this.ttl;
    const routeFolder = path.join(this.cacheFolder, prefix)
    if (!fs.existsSync(routeFolder))
      fs.mkdirSync(routeFolder);
    const self = this;
    return async (ctx, next) => {
      const ids = Object.entries(ctx.query)
        .filter(([k, ]) => keys.includes(k))
        .sort();
      const cacheKey = crypto.createHash('md5').update(JSON.stringify(ids)).digest('base64');
      const cacheFileName = path.join(routeFolder, cacheKey);
      const cacheObj = await self.findCache(cacheFileName);
      if (cacheObj && cacheObj.exp > Date.now()) {
          ctx.body = cacheObj.data;
      } else {
          await next();
          if (ctx.status === 200)
            fs.writeFile(cacheFileName, JSON.stringify({ data: ctx.body, exp: Date.now() + ttl }), () => {});
      }
    }
  }

  /**
   * return context of file by path
   * 
   * @private
   * @param {string} path
   * @returns
   * @memberof CacheMiddleware
   */
  async findCache(path) {
    try {
      return JSON.parse(await readFile(path));
    } catch (err) {
      if (err.code !== 'ENOENT') fs.unlink(path, () => {});
      return null;
    }
  }

  /**
   * clear cache by prefix
   *
   * @param {string} prefix
   * @memberof CacheMiddleware
   */
  async clearCache(prefix) {
    const filesPath = path.join(this.cacheFolder, prefix, '/*');
    rimraf(filesPath, (err) => {
      if (err) console.error(err);
    });
  }
}

module.exports = CacheMiddleware;
