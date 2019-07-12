'use strict';

class EntityController {
  constructor(dbmanager) {
    this.db = dbmanager;
    this.table = '';
    this.sortBy = ['id'];
    this.fields = [];
    this.whereBy = {
      id: {
        gt: '>',
        gte: '>=',
        eq: '=',
        lt: '<',
        lte: '<=',
      },
    };   
  }

  async addRow({ params }) {
    const { query, values } = this.db.buildInsert(this.table, this.fields, params);
    if (values.length === 0 ) return false;    
    const connection = await this.db.getConnection();
    const [row, ] = await connection.execute(query, values);
    connection.release();
    if (row && row.affectedRows)
      return true;
    else
      return false;
  }

  async editRow({ id, params }) {
    const { query, values } = this.db.buildUpdate(this.table, this.fields, params)
    if (values.length === 0) return false;
    const connection = await this.db.getConnection();
    const [row, ] = await connection.execute(query, [...values, id]);
    connection.release();
    if (row && row.affectedRows)
      return true;
    else
      return false;
  }

  async getRows({ params }) {
    const { query, values } = this.db.buildSelect({
      table: this.table,
      allowedWhere: this.whereBy,
      allowedSort: this.sortBy,
      ...params,
    });
    const connection = await this.db.getConnection();
    const [rows, ] = await connection.execute(query, values);
    connection.release();
    return rows;
  }

  async initTable(tableDefinition) {
    const connection = await this.db.getConnection();
    await connection.query(tableDefinition);
    await connection.release();
  }
}

module.exports = EntityController;