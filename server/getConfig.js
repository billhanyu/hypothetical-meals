export default function getConfig() {
  let config;
  try {
    config = require('./config');
  } catch (e) {
    config = require('./config.example');
  }
  return config;
}
