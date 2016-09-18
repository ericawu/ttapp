Template.displayScore.helpers({
    'playerFromId': function(id) {
        return Meteor.users.findOne({_id: id});
    },
    'p1win': function() {
        var match = Template.parentData(1);
        if (!match.completed) {
            return false;
        }
        var games = match.games;
        var counter = 0;
        console.log("displayScore.helpers");
        if (games != null) {
            for (var i = 0 ; i < games.length; i++) {
                if (greater(games[i].points1, games[i].points2)) {
                    counter++;
                } else if (greater(games[i].points2, games[i].points1)) {
                    counter--;
                }
            }
        }
        return counter > 0;
    },
    'p2win': function() {
        var match = Template.parentData(1);
        if (!match.completed) {
            return false;
        }
        var games = match.games;
        var counter = 0;
        console.log("p2win");
        if (games != null) {
            for (var i = 0 ; i < games.length; i++) {
                if (greater(games[i].points1, games[i].points2)) {
                    counter++;
                } else if (greater(games[i].points2, games[i].points1)) {
                    counter--;
                }
            }
        }
        return counter < 0;
    },
    'dateString': function() {
        var date = Template.currentData().date;
        // return date.getHours() + ":" + date.getMinutes() + " \u2013 " + (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
        return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
    }
});

Template.displayPoints.helpers({
    'isGreater': function(x, y) {
        return greater(x, y);
    },
    'isFirst': function(num) {
        return num == 1;
    },
    'gameFinished': function() {
        console.log("displayPoints.helpers");
        var match = Template.parentData(1);
        var gameNum = Template.currentData().num;
        return match.completed || gameNum != match.games.length;
    }
});

function greater(x, y) {
    return parseInt(x) > parseInt(y);
}
