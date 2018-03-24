const fs = require('fs');
const setupTablesCommands = fs.readFileSync('./server/create_database.sql', 'utf8');
const setupTestDataCommands = fs.readFileSync('./server/sample_data.sql', 'utf8');

module.exports.setupTestDatabase = function() {
  return new Promise((resolve, reject) => {
      connection.query(setupTablesCommands.replace(/[\t\n]+/g, ' '))
        .then(() => connection.query(setupTestDataCommands.replace(/[\t\n]+/g, ' ')))
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error);
          reject();
        });
  });
};
