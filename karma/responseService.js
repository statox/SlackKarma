const axios = require('axios');

var service = {};

service.confirmKarma = function (user, responseUrl) {
    var response = {}
    response.response_type = 'ephemeral';
    response.text = 'You gave ' + user.id + ' one karma point';
    response.text += '\ntotal: ' + user.score;

    axios.post(responseUrl, response);
}

service.rejectKarma = function (reason, responseUrl) {
    var response = {};
    response.response_type = 'ephemeral';

    if (reason === 'SELF') {
        response.text = 'Don\'t be greedy you can\'t give karma to yourself!';
    } else if (reason === 'TWICE') {
        response.text = 'You already gave karma for this message';
    }

    axios.post(responseUrl, response);
}

service.scoreNotFound = function() {
    return 'This user doesn\'t have any karma yet';
}

service.singleScore = function(score) {
    var response = '**The current position of ' + score.name + ':**\n';
    response += 'Position: ' + score.position + '    Score: ' + score.score;

    return response;
}

service.leaderBoardScore = function(scores, score) {
    var response = '**Current leaderboard of Karma points:**\n';
    scores.forEach(score => {
        response += score.currentUser ? '**' : '';
        response += score.name + ': ' + score.score
        response += score.currentUser ? '**' : '';
        response += '\n';
    });

    return response;
}

module.exports = service;
