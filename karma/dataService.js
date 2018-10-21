const fs = require('fs');

var service = {};

// Path to the file where to keep the store
var ID_FILE_PATH = './store.json';

/*
 * Read the points from a file or initialize it
 */
service.getStore = function () {
    if (fs.existsSync(ID_FILE_PATH)) {
        var data = fs.readFileSync(ID_FILE_PATH, 'utf-8');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (err) {
                return {users: {}, messages: {}};
            }
        }
    }

    return {users: {}, messages: {}};
}

/*
 * Write the current scores in the local file, create the file if necessary
 */
service.setStore = function (store) {
    fs.writeFileSync(ID_FILE_PATH, JSON.stringify(store), 'utf-8');
}

module.exports = service;
