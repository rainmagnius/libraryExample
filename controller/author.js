'use strict';

const EntityController = require('./entity');

class AuthorController extends EntityController {
  constructor(dbmanager) {
    super(dbmanager);
    this.db = dbmanager;
    this.table = 'author';
    this.sortBy = ['id', 'name'];
    this.fields = ['name'];
    this.whereBy = {
      name: { like: 'LIKE' },
      id: {
        gt: '>',
        gte: '>=',
        eq: '=',
        lt: '<',
        lte: '<=',
      },
    };   
  }

  async initTable() {
    const tableDefinition = 
    `CREATE TABLE IF NOT EXISTS author (
      id INT AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
    );`;
    await super.initTable(tableDefinition);
  }
}

module.exports = AuthorController;
