import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'matches.update': function(matchId, gameNum, playerNum, value) {
        value = value ? value : 0;
        if (playerNum == 1) {
            Matches.update(
                {_id: matchId, "games.num": gameNum}, 
                {$set: {'games.$.points1': value}}
                );
        } else if (playerNum == 2) {
            Matches.update(
                {_id: matchId, "games.num": gameNum}, 
                {$set: {'games.$.points2': value}}
                );
        } else {
            alert("Invalid player number");
        }
    },

    'calculate-rating': function(matchId) {
        var match = Matches.findOne({_id: matchId});
        //if track > 0, p1 won and vice versa
        var track = 0;
        for (var i = 0; i < match.games.length; i++) {
            var game = match.games[i];
            var status = parseInt(game.points1) - parseInt(game.points2);
            if (status > 0) track++;
            else if (status < 0) track--;
        }

        var p1 = match.p1;
        var p2 = match.p2;
        var ratingDiff = Math.abs(p1.profile.rating - p2.profile.rating);
        var upset = 0;
        var normal = 0;

        //can this be calculated somewhere else? a helper function?
        if (ratingDiff <= 12) {
            normal = 8;
            upset = 8; 
        }
        else if (ratingDiff <= 37) {
            normal = 7;
            upset = 10;
        }
        else if (ratingDiff <= 62) {
            normal = 6;
            upset = 13;
        }
        else if (ratingDiff <= 87) {
            normal = 5;
            upset = 16;
        }
        else if (ratingDiff <= 112) {
            normal = 4;
            upset = 20;
        }
        else if (ratingDiff <= 137) {
            normal = 3;
            upset = 25;
        }
        else if (ratingDiff <= 162) {
            normal = 2;
            upset = 30;
        }
        else if (ratingDiff <= 187) {
            normal = 2;
            upset = 35;
        }
        else if (ratingDiff <= 212) {
            normal = 1;
            upset = 45;
        }
        else if (ratingDiff <= 237) {
            normal = 1;
            upset = 45;
        }
        else {
            normal = 0;
            upset = 50;
        }

        var higherP = ((p1.profile.rating - p2.profile.rating) > 0) ? p1 : p2;
        var lowerP = ((p1.profile.rating - p2.profile.rating) >= 1) ? p2 : p1;

        if ((higherP == p1 && track > 0) || (higherP == p2 && track < 0)) {
                //use expected
                Meteor.users.update(higherP._id, {$set: {
                    "profile.rating": higherP.profile.rating + normal
                }});
                Meteor.users.update(lowerP._id, {$set: {
                    "profile.rating": lowerP.profile.rating - normal
                }});
            }
        else if ( (higherP == p1 && track < 0) || (higherP == p2 && track > 0) ) {
            //use upset
            Meteor.users.update(higherP._id, {$set: {
                "profile.rating": higherP.profile.rating - upset
            }});
            Meteor.users.update(lowerP._id, {$set: {
                "profile.rating": lowerP.profile.rating + upset
            }});
        }
            //don't do anything if it's a tie (track == 0), add in point comparisons later
    }
});