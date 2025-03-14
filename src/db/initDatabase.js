const { Sequelize } = require('sequelize');
require('dotenv').config();

const initDatabase = async () => {
  try {
    const bootstrapSequelize = new Sequelize(
      null, 
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
      }
    );

    await bootstrapSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database created or already exists.`);

    await bootstrapSequelize.close();
  } catch (error) {
    console.error("Error during DB bootstrap:", error);
    throw error;
  }
};

module.exports = initDatabase;