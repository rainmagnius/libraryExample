'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const renameFile = promisify(fs.rename);
const EntityController = require('./entity');

class BookController extends EntityController {
  constructor(dbmanager, fileFolder) {
    super(dbmanager);
    this.fileFolder = fileFolder;
    if (!fs.existsSync(fileFolder))
      fs.mkdirSync(fileFolder);
    this.table = 'book';
    this.fields = ['title', 'date', 'author_id', 'description', 'image'];
    this.sortBy = ['id', 'title', 'date', 'author_id', 'description'];
    this.whereBy = {
      title: { like: 'LIKE' },
      description: { like: 'LIKE' },
      id: {
        gt: '>',
        gte: '>=',
        eq: '=',
        lt: '<',
        lte: '<=',
      },
      author_id: {
        gt: '>',
        gte: '>=',
        eq: '=',
        lt: '<',
        lte: '<=',
      },
      date: {
        gt: '>',
        gte: '>=',
        eq: '=',
        lt: '<',
        lte: '<=',
      },
    };
  }

  async addRow({ params }) {
    if (!params.image) return super.addRow({ params });
    
    const tmpFilePath = params.image.path;
    const ext = path.extname(params.image.originalname);
    const newFilePath = `${path.join(this.fileFolder, params.image.filename)}${ext}`;
    const paramsObj = { ...params };
    paramsObj.image = newFilePath;

    const { query, values } = this.db.buildInsert(this.table, this.fields, paramsObj);
    if (values.length === 0 ) return false;
    let connection;
    try {
      connection = await this.db.getConnection();
      await connection.query('START TRANSACTION;')
      const [row, ] = await connection.execute(query, values);
      if (row && row.affectedRows) {
        await renameFile(tmpFilePath, newFilePath);
        await connection.query('COMMIT;');
        connection.release();
        return row.insertId;
      } else {
        fs.unlink(tmpFilePath, () => {});
        await connection.query('ROLLBACK;');
        connection.release();
        return false;
      }
    } catch (err) {
      console.error(err);
      if (connection) {
        fs.unlink(tmpFilePath, () => {});
        fs.unlink(newFilePath, () => {});
        await connection.query('ROLLBACK;');
        connection.release();
      }
      return false;
    }
  }

  async editRow({ id, params }) {
    if (!params.image) return super.editRow({ params });    
    
    const tmpFilePath = params.image.path;
    const ext = path.extname(params.image.originalname);
    const newFilePath = `${path.join(this.fileFolder, params.image.filename)}${ext}`;
    const paramsObj = { ...params };
    paramsObj.image = newFilePath;

    const { query, values } = this.db.buildUpdate(this.table, this.fields, paramsObj);
    if (values.length === 0 ) return false;
    let connection;
    try {
      connection = await this.db.getConnection();
      await connection.query('START TRANSACTION;')
      const [old, ] = await connection.execute(`SELECT * from ${this.table} WHERE id = ${id}`);
      if (!old || !old[0]) {
        await connection.query('COMMIT;');
        connection.release();
        return false;
      }
      const [row, ] = await connection.execute(query, [...values, id]);
      if (row && row.affectedRows) {
        await renameFile(tmpFilePath, newFilePath);
        await connection.query('COMMIT;');
        connection.release();
        if (old[0].image) fs.unlink(old[0].image, () => {});
        return true;
      } else {
        fs.unlink(tmpFilePath, () => {});
        await connection.query('ROLLBACK;');
        connection.release();
        return false;
      }
    } catch (err) {
      console.error(err);
      if (connection) {
        fs.unlink(tmpFilePath, () => {});
        fs.unlink(newFilePath, () => {});
        await connection.query('ROLLBACK;');
        connection.release();
      }
      return false;
    }
  }

  async initTable() {
    const tableDefinition =
    `CREATE TABLE IF NOT EXISTS book (
      id INT AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      date DATE,
      author_id INT,
      description TEXT,
      image VARCHAR(255),
      PRIMARY KEY (id),
      FOREIGN KEY (author_id)
        REFERENCES author(id)
        ON DELETE SET NULL
    );`;
    await super.initTable(tableDefinition);
  }
}

module.exports = BookController;
