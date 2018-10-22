var karma = require("../karma/karmaService.js");

var appRouter = function (app) {
    /*
     * Message action to give karma
     */
    app.post("/karma", function(req, res) {
        console.log("/karma ...");
        karma.give(req, res);
        res.status(200).send();
        console.log("/karma DONE");
    });

    /*
     * Manage Karma through reactions emojis
     */
    app.post("/karma/reaction", function(req, res) {
        console.log("/karma/reaction ...");
        var challenge = karma.giveFromReaction(req, res);
        res.status(200).send(challenge);
        console.log("/karma/reaction DONE");
    });

    /*
     * Getting the scores
     */
    app.post("/karma/score", function(req, res) {
        console.log("/karma/score ...");
        karma.get(req, res).then(response => {
            res.status(200).send(response);
            console.log("/karma/score DONE");
        });
    });
}

module.exports = appRouter;
