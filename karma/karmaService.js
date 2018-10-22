const userService = require('./userService.js')
const dataService = require('./dataService.js');
const responseService = require('./responseService.js');

var karma = {}

/*
 * Increment or decrement the karma of a user when a reaction
 * is added to one message
 */
karma.giveFromReaction = function(req, res) {
    var payload = req.body;

    // Code to return the challenge part of the body to verify the
    // slack integration
    if (payload.challenge) {
        return payload.challenge;
    }

    var poster     = payload.event.item_user;
    var requester  = payload.event.user;
    var action     = payload.event.type;
    var reaction   = payload.event.reaction;


    // We only monitor the thumbsup reaction
    if (reaction !== '+1') {
        console.log("Wront event, don't trigger the karma count", payload.event.reaction);
        return
    }

    // Ignore the reaction on user's self post
    if (poster === requester) {
        console.log("Don't count karma on self post", poster, requester);
        return;
    }

    // Getting the score of the user or initializing it
    var score = 0;
    if (karma.store.users[poster]) {
        score = karma.store.users[poster];
    }

    // Modification of the poster score
    if (action === "reaction_added") {
        console.log("incrementing the score", action, poster);
        score++;
    } else {
        console.log("decrementing the score", action, poster);
        score --;
    }

    karma.store.users[poster] = score;

    // Keep the state
    dataService.setStore(karma.store);
}

/*
 * Given a request sent by slack action
 * Increment the karma of the user
 */
karma.giveFromAction = function(req, res) {
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
