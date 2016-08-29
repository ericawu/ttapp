import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'matches.update': function(matchId, gameNum, playerNum, value) {
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
    }
});