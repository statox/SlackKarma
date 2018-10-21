const axios = require('axios');
const config = require('../config.json');

var user = {};

var URL_USERS_LIST = 'https://slack.com/api/users.list';
var APP_TOKEN = config.APP_TOKEN;

user.getUsersList = async function() {
    var params = {
        token: APP_TOKEN
    };

    return axios.get(URL_USERS_LIST, params = {params})
    .then(res => {
        return res.data.members.map(user => {
            var name = user.name;
            if (user.profile.display_name_normalized) {
                name = user.profile.display_name_normalized
            } else if (user.profile.display_name) {
                name = user.profile.display_name
            } else if (user.profile.real_name_normalized) {
                name = user.profile.real_name_normalized
            } else if (user.profile.real_name) {
                name = user.profile.real_name
            }

            return {
                id: user.id,
                name: name
            };
        });
    });
}

module.exports = user;
