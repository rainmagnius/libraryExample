'use strict';

const mysql = require('mysql2');

class DBManager {
  constructor({ user, password, database, host = "localhost", port = 3306 }) {
    this.pool = mysql.createPool({ user, password, database, host, port, }).promise();
    this.bookFields = ['title', 'date', 'author_id', 'description'];
    this.bookSort = ['id', 'title', 'description', 'author_id'];
    this.bookWhere = {
      title: { like: 'LIKE' },
      description: { like: 'LIKE' },
      id: {
        gte: '>=',
        eq: '=',
        lte: '<=',
      },
      author_id: {
        gte: '>=',
        eq: '=',
        lte: '<=',
      },
      date: {
        gte: '>=',
        eq: '=',
        lte: '<=',
      },
    };

    this.authorSort = ['id', 'name'];
    this.authorFields = ['name'];
    this.authorWhere = {
      name: { like: 'LIKE' },
      id: {
        gte: '>=',
        eq: '=',
        lte: '<=',
      },
    };   
  }

  async init() {
    try {
      await this.initAuthorTable();
      await this.initBookTable();
    } catch (err) {
      console.error('Database not initialized');
      throw err;
    }
  }

  async initAuthorTable() {
    await this.pool.query(`CREATE TABLE IF NOT EXISTS author (
                            id INT AUTO_INCREMENT,
                            name VARCHAR(255) NOT NULL,
                            PRIMARY KEY (id)
                          );`);
  }

  async initBookTable() {
    await this.pool.query(`CREATE TABLE IF NOT EXISTS book (
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
                          );`);
  }

  async getAuthors({ orderBy = { id: "ASC" }, limit = 100, offset = 0, ...query } = {}) {
    let sql = 'SELECT * FROM author ';
    const { where, values } = this.buildWhere(this.authorWhere, query);
    sql += where;
    const order = this.buildOrder(this.authorSort, orderBy);
    sql += order;
    sql += 'LIMIT ? OFFSET ?;';
    const [rows, ] = await this.pool.execute(sql, [...values, limit, offset]);
    return rows;
  }

  async addAuthor({ ...params }) {
    const { insert, values } = this.buildInsert(this.authorFields, params);
    if (values.length === 0) return false;
    const sql = `INSERT INTO author ${insert};`;
    const [row, ] = await this.pool.execute(sql, values);
    if (row && row.insertId)
      return row.insertId;
    else
      return null;
  }

  async editAuthor({ id, ...params }) {
    let sql = 'UPDATE author SET '
    const { set, values } = this.buildSet(this.authorFields, params)
    if (values.length === 0) return false;
    sql += set;
    sql += 'WHERE id = ?;';
    const [row, ] = await this.pool.execute(sql, [...set, id]);
    if (row && row.affectedRows)
      return true;
    else
      return false;
  }

  async getBooks({ orderBy = { id: "ASC" }, limit = 100, offset = 0, ...query } = {}) {
    let sql = 'SELECT * FROM book ';
    const { where, values } = this.buildWhere(this.bookWhere, query);
    sql += where;
    const order = this.buildOrder(this.bookSort, orderBy);
    sql += order;
    sql += 'LIMIT ? OFFSET ?;';
    const [rows, ] = await this.pool.execute(sql, [...values, limit, offset]);
    return rows;
  }

  async addBook({ ...params }) {
    const { insert, values } = this.buildInsert(this.bookFields, params);
    if (values.length === 0) return false;
    const sql = `INSERT INTO book ${insert};`;
    const [row, ] = await this.pool.execute(sql, values);
    if (row && row.affectedRows)
      return true;
    else
      return false;
  }

  async editBook({ id, ...params }) {
    let sql = 'UPDATE book SET '
    const { set, values } = this.buildSet(this.bookFields, params)
    if (values.length === 0) return false;
    sql += set;
    sql += 'WHERE id = ?;';
    const [row, ] = await this.pool.execute(sql, [...set, id]);
    if (row && row.affectedRows)
      return true;
    else
      return false;
  }

  /**
   * Create insert clause based on allowed fields
   * Trash data will be ignored
   * 
   * @param {Array<string} fields allowed fields
   * @param {object} params object with params to insert
   * @returns
   * @memberof DBManager
   */
  buildInsert( table, fields, params ) {
    const insert = [];
    const values = [];
    for (let [field, value ] of Object.entries(params)) {
      if (fields.includes(field))
        insert.push(field);
        values.push(value);
    }
    if (insert.length > 0) {
      let sql = `(${insert.join(',')}) `;
      sql += `VALUES (${'?,'.repeat(insert.length - 1)}?)`;    
      return { values, insert: sql };
    } else {
      return { values, insert: '' };
    }
  }

  /**
   * Create sort clause based on allowed fields
   * Trash data will be ignored
   *
   * @param {Array<string>} fields allowed fields
   * @param {object} orderBy object with sort params
   * @returns
   * @memberof DBManager
   */
  buildOrder( fields, orderBy ) {
    const order = [];
    for (let [field, sort] of Object.entries(orderBy)) {
      if (Array.isArray(sort)) sort = sort[0];
      if (typeof sort !== 'string') continue;
      if (fields.includes(field) && ['ASC', 'DESC'].includes(sort.toUpperCase()))
        order.push(`${field} ${sort}`);
    }
    if (order.length > 0)
      return `ORDER BY ${order.join(', ')} `;
    else 
      return '';
  }

  /**
   * Create where clause based on allowed fields and operations.
   * All of params will be concat as AND query
   * Trash data will be ignored
   *
   * @param {object} fields describe allowed fields and operation
   * @param {object} params object of query params
   * @return {object} object with query clause and values for it in order
   * @memberof DBManager
  */
  buildWhere( fields, params ) {
    const where = [];
    const values = [];
    for (let [param, ops] of Object.entries(params)) {
      if (typeof ops !== 'object') continue;
      if (param in fields) {
        for (let [op, value] of Object.entries(ops)) {
          if (Array.isArray(value)) value = value[0];
          if (typeof value !== 'string') continue;
          if (op in fields[param]) {
            where.push(`${param} ${fields[param][op]} ?`);
            values.push(value);
          }
        }
      }
    }
    if (where.length > 0)
      return { values, where: `WHERE ${where.join(' AND ')} ` };
    else
      return { values, where: '' };
  }

  /**
   * Create set clause based on allowed fields
   * Trash data will be ignored
   *
   * @param {Array<string>} fields allowed fields
   * @param {object} params object with params to update
   * @returns
   * @memberof DBManager
   */
  buildSet( fields, params) {
    const set = [];
    const values = [];
    for (let [param, value] of Object.entries(params)) {
      if (Array.isArray(value)) value = value[0];
      if (typeof value !== 'string') continue;
      if (fields.includes(param))
        set.push(`${param} = ?`);
        values.push(value);
    }
    if (set.length > 0)
      return { values, set: `SET ${set.join(', ')} ` };
    else
      return { values, set: '' };
  }
}

module.exports = DBManager;