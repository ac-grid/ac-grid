import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const loglevel = require('loglevel');

export default loglevel;
export const {
  trace,
  debug,
  info,
  warn,
  error,
  setLevel,
  setDefaultLevel,
  enableAll,
  disableAll,
  getLogger,
  methodFactory,
  levels,
  getLoggers,
  noConflict,
  log,
} = loglevel;
