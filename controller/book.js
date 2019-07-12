'use strict';

const EntityController = require('./entity');

class BookController extends EntityController {
  constructor(dbmanager) {
    super(dbmanager);
    this.table = 'book';
    this.fields = ['title', 'date', 'author_id', 'description'];
    this.sortBy = ['id', 'title', 'description', 'author_id'];
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
