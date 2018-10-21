var karma = require("../karma/karmaService.js");

var appRouter = function (app) {
    /*
     * Message action to give karma
     */
    app.post("/karma", function(req, res) {
        karma.give(req, res);
        res.status(200).send();
    });

    /*
     * Getting the scores
     */
    app.post("/karma/score", function(req, res) {
        karma.get(req, res).then(response => {
            res.status(200).send(response);
        });
    });
}

module.exports = appRouter;
