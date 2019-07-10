'use strict';

const config = require('config');
const Koa = require('koa');
const Router = require('@koa/router');
const mysql = require('mysql2');

const app = new Koa();
app.listen(config.port)