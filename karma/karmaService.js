const userService = require('./userService.js')
const dataService = require('./dataService.js');
const responseService = require('./responseService.js');

var karma = {}

/*
 * Given a request sent by slack action
 * Increment the karma of the user
 */
karma.give = function(req, res) {
    var payload = JSON.parse(req.body.payload);

    if (payload.callback_id !== 'give-karma') {
        return;
    }

    var poster = payload.message.user;
    var requester = payload.user.id;
    var messageId = payload.message.client_msg_id;

    // Disable voting for yourself
    if (poster === requester) {
        responseService.rejectKarma('SELF', payload.response_url);
    // Disable voting twice
    } else if (karma.store.messages[messageId] && karma.store.messages[messageId].indexOf(requester) > -1) {
        responseService.rejectKarma('TWICE', payload.response_url);
    } else {
        // Getting the score of the user or initializing it
        var score = 0;
        if (karma.store.users[poster]) {
            score = karma.store.users[poster];
        }

        // Increment the poster score
        score++;
        karma.store.users[poster] = score;

        // Record the vote
        if (karma.store.messages[messageId]) {
            karma.store.messages[messageId].push(requester);
        } else {
            karma.store.messages[messageId] = [requester];
        }

        // Keep the state
        dataService.setStore(karma.store);
        responseService.confirmKarma({id: poster, score:score}, payload.response_url);
    }
}

/*
 * Show the leaderboard of Karma points
 */
karma.get = async function(req, res) {
    var payload = req.body;

    // If the user provided a specific user try to get it
    var userSpecified = false;
    var searchedUser;
    if (payload.text) {
        var idRegex = '@([^|]+)';
        var res = payload.text.match(idRegex);
        if (res && res[1]) {
            searchedUser = res[1];
            userSpecified = true;
        }
    }

    if (!userSpecified) {
        searchedUser = payload.user_id;
    }

    // Get the list of all the users in the team
    var users = await userService.getUsersList();

    // Join the list of users and the store
    // to get the scores of every users
    var scores = [];
    users.forEach(user => {
        if (karma.store.users[user.id]) {
            scores.push({
                id: user.id,
                name: user.name,
                score: karma.store.users[user.id],
                currentUser: searchedUser === user.id
            });
        }
    });

    // The the array by score of users
    scores.sort((a, b) => b.score - a.score);

    // Forge the answer
    var response;
    if (userSpecified) {
        var score = scores.find(s => s.currentUser);

        if (score) {
            score.position = scores.indexOf(score) + 1;
            response = responseService.singleScore(score);
        } else {
            response = responseService.scoreNotFound();
        }
    } else {
        response = responseService.leaderBoardScore(scores, score);
    }

    return response;
}

// Initialize the module by loading the current scores
karma.store = dataService.getStore();
module.exports = karma;
