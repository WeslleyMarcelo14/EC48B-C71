const fs = require('fs');
const path = require('path');
const config = require('../config/env');

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function rotateIfNeeded(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size >= config.log.maxSizeBytes) {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        fs.renameSync(filePath, filePath + '.' + ts + '.bak');
      }
    }
  } catch (_) { /* ignorar rotação falha */ }
}

class Logger {
  constructor() {
    ensureDir(config.log.dir);
    this.appLog = path.join(config.log.dir, 'app.log');
    this.errorLog = path.join(config.log.dir, 'error.log');
  }
  _write(file, level, msg, meta) {
    rotateIfNeeded(file);
    const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...meta }) + '\n';
    fs.appendFile(file, line, () => {});
  }
  info(msg, meta = {}) { this._write(this.appLog, 'INFO', msg, meta); }
  warn(msg, meta = {}) { this._write(this.appLog, 'WARN', msg, meta); }
  error(msg, meta = {}) { this._write(this.errorLog, 'ERROR', msg, meta); }
  captureError(err, context = {}) {
    this.error(err.message, { name: err.name, stack: err.stack, ...context });
  }
}
module.exports = new Logger();
