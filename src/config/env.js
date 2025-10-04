try {
  const dotenv = require('dotenv');
  if (dotenv && typeof dotenv.config === 'function') dotenv.config();
} catch (e) {
  // dotenv não instalado, seguir em frente
}

const config = {
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB || 'deliverydb'
  },
  log: {
    dir: process.env.LOG_DIR || 'logs',
    maxSizeBytes: parseInt(process.env.LOG_MAX_SIZE || '1048576', 10) // 1MB
  }
};
module.exports = config;
