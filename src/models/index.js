const sequelize = require('../config/database');  
const { DataTypes } = require('sequelize');

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
  
},{
    timestamps : false,
    tableName : "HealthCheck"
  }

);

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database is Connected.');
    await sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { HealthCheck, initializeDatabase, sequelize };  