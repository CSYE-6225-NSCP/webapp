const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const HealthCheck = sequelize.define('HealthCheck', {
  CheckId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  timestamps: false,
  tableName: "HealthCheck",
});

module.exports = { HealthCheck, sequelize };