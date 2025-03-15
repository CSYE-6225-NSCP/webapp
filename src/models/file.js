const { DataTypes } = require('sequelize');
const  sequelize  = require('../config/database');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Files',
});

module.exports = { File };