const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../../debug.log');

module.exports = (fn) => {
  return (req, res, next) => {
    fs.appendFileSync(logFile, `\n[wrapAsync] Calling function for ${req.method} ${req.url}\n`);
    try {
      const result = fn(req, res, next);
      fs.appendFileSync(logFile, `[wrapAsync] Got result, is Promise: ${result instanceof Promise}\n`);
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          fs.appendFileSync(logFile, `[wrapAsync] Caught error: ${err.message}\n`);
          next(err);
        });
      } else {
        fs.appendFileSync(logFile, `[wrapAsync] Result is not a Promise!\n`);
      }
    } catch (syncErr) {
      fs.appendFileSync(logFile, `[wrapAsync] Synchronous error: ${syncErr.message}\n`);
      next(syncErr);
    }
  };
};