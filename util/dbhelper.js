'use strict';

const mysql = require('mysql2');

class DBHelper {
  constructor({ user, password, database, host = "localhost", port = 3306 }) {
    this.pool = mysql.createPool({ user, password, database, host, port, }).promise();
  }

  /**
   * Create insert clause based on allowed fields
   * Trash data will be ignored
   * return object with query and valid but raw values
   * 
   * @param {Array<string} fields allowed fields
   * @param {object} params object with params to insert
   * @returns
   * @memberof DBHelper
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
      let sql = `INSERT INTO ${table} (${insert.join(',')}) `;
      sql += `VALUES (${'?,'.repeat(insert.length - 1)}?);`;    
      return { values, query: sql };
    } else {
      return { values, query: '' };
    }
  }

  /**
   * Create sort clause based on allowed fields
   * Trash data will be ignored
   * return order by part of query
   * 
   * @param {Array<string>} fields allowed fields
   * @param {object} orderBy object with sort params
   * @returns
   * @memberof DBHelper
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
   * Create select query based on allowed filters and sort
   * Trash data will be ignored
   * return object with query and valid but raw values
   * 
   * @param {string} table table to select
   * @param {Array<string>} allowedWhere fields allowed to filter
   * @param {Array<string>} allowedSort fields allowed to sort
   * @param {object} [orderBy = { id: "ASC" }] sort object
   * @param {number} [limit = 100] limit of rows
   * @param {number} [offset = 0] offset of rows
   * @param {...object} filters object of filters
   * 
   * @returns {object}
   * @memberof DBHelper
   */
  buildSelect({ table, allowedWhere, allowedSort, orderBy = { id: "ASC" }, limit = 100, offset = 0, ...filters } = {}){
    console.log(filters);
    let query = `SELECT * FROM ${table} `;
    const { where, values } = this.buildWhere(allowedWhere, filters);
    query += where;
    const order = this.buildOrder(allowedSort, orderBy);
    query += order;
    query += 'LIMIT ? OFFSET ?;';
    return { query, values: [...values, limit, offset] };
  }

  /**
   * Create update query based on allowed fields
   * Trash data will be ignored
   * return object with query and valid but raw values
   *
   * @param {string} table table to update
   * @param {Array<string>} fields allowed fields
   * @param {object} params object with params to update
   * @returns
   * @memberof DBHelper
   */
  buildUpdate( table, fields, params) {
    const set = [];
    const values = [];
    for (let [param, value] of Object.entries(params)) {
      if (fields.includes(param))
        set.push(`${param} = ?`);
        values.push(value);
    }
    if (set.length > 0) {
      const query = `UPDATE ${table} SET ${set.join(', ')} WHERE id = ?;`;
      return { values, query };
    } else {
      return { values, query: '' };
    }
  }

  /**
   * Create where clause based on allowed fields and operations.
   * All of params will be concat as AND query
   * Trash data will be ignored
   * return object with where part of query and valid but raw values
   *
   * @param {object} fields describe allowed fields and operation
   * @param {object} params object of query params
   * @return {object} object with query clause and values for it in order
   * @memberof DBHelper
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
   * return connection to database from pool
   *
   * @returns
   * @memberof DBHelper
   */
  async getConnection() {
    return this.pool.getConnection();
  }
}

module.exports = DBHelper;