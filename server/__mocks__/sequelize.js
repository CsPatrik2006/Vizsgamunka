// Mock Sequelize implementation
class Model {
  static init() { return this; }
  static belongsTo() { return this; }
  static hasMany() { return this; }
}

const SequelizeMock = {
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue(Model),
  DataTypes: {
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    TEXT: 'TEXT',
    ENUM: (...values) => ({ values })
  },
  Op: {
    eq: Symbol('eq'),
    ne: Symbol('ne'),
    gte: Symbol('gte'),
    gt: Symbol('gt'),
    lte: Symbol('lte'),
    lt: Symbol('lt'),
    and: Symbol('and'),
    or: Symbol('or'),
    like: Symbol('like'),
    in: Symbol('in')
  }
};

const Sequelize = jest.fn(() => SequelizeMock);
Sequelize.DataTypes = SequelizeMock.DataTypes;
Sequelize.Op = SequelizeMock.Op;
Sequelize.Model = Model;

module.exports = { Sequelize };