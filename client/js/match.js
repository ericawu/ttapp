Template.match_page.helpers({
    opponent: function() {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        return Meteor.users.findOne({_id: id});
    },
    match: function() {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        return Matches.findOne({_id: id});
    }
});

Template.displayScore_large.onDestroyed(function() {
    Session.set('games', undefined);
    Session.set('editMode', false);
})

Template.displayScore_large.helpers({
    'playerFromId': function(id) {
        return Meteor.users.findOne({_id: id});
    },
    'p1win': function() {
        var match = Template.parentData(1);
        if (!match || !match.completed) {
            return false;
        }
        return netGames(match) > 0;
    },
    'p2win': function() {
        var match = Template.parentData(1);
        if (!match || !match.completed) {
            return false;
        }
        return netGames(match) < 0;
    },
    'dateString': function() {
        if (!Template.currentData()) {
            return "";
        }
        var date = Template.currentData().date;
        return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
    },
    'editable': function(id1, id2) {
        return Meteor.userId() == id1 || Meteor.userId() == id2;
    },
    'editMode': function() {
        return Session.get('editMode');
    },
    'games_edit': function() {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var match = Matches.findOne({_id: id});
        if (!match) {
            return [];
        }
        return match.games;
    }
});

Template.displayScore_large.events({
    'click #btn-done': function(e) {
        Session.set('editMode', false);
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var games = Matches.findOne({_id: id}).games;
        for (var i = games.length-1; i >= 0; i--) {
            if (games[i].points1 == "0" && games[i].points2 == "0") {
                games.splice(i,1)
            }
        }
        for (var i = 0; i < games.length; i++) {
            games[i].num = i+1;
        }
        var fillerNum = boNumFromGames(games) - games.length;
        var filler = [];
        for (var i = 0 ; i < fillerNum; i++) {
            filler.push({num: games.length+i+1});
        }
        if (!Matches.findOne({_id: id}).completed) {
            Meteor.call('calculate-rating', id, games);
        }
        Matches.update({_id: id}, {$set: {completed: true, games: games, fillers: filler}});
        FlowRouter.go('home');
    },
    'click #btn-edit': function(e) {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var games = Matches.findOne({_id: id}).games;
        Session.set('games', games);
        Session.set('editMode', true);
    },
    'click #btn-delete': function(e) {
        if (Session.get('editMode')) { // Cancel edit
            var id = Session.get('param-id') || FlowRouter.getParam('_id');
            updateGames(id, Session.get('games'));
            Session.set('editMode', false);
        } else { // Delete game
            if (confirm("Are you sure you want to delete this match?")) {
                var id = Session.get('param-id') || FlowRouter.getParam('_id');
                Matches.remove({_id: id});
                Session.set('opponent', undefined);
                FlowRouter.go('home');
            }
        }
    },
    'click #btn-add': function(e) {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var games = Matches.findOne({_id: id}).games;
        games.push({points1: "0", points2: "0", num: games.length + 1});
        updateGames(id, games);
    },
    'click .plus-points': function(e) {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var games = Matches.findOne({_id: id}).games;

        if (e.target.getAttribute("pNum") == 1) {
            games[games.length-1].points1 = "" + (parseInt(games[games.length-1].points1) + 1);
        } else if (e.target.getAttribute("pNum") == 2) {
            games[games.length-1].points2 = "" + (parseInt(games[games.length-1].points2) + 1);
        }
        updateGames(id, games);

        var plusPointsText = e.target.children[0]
        plusPointsText.classList.add("clicked");
        plusPointsText.classList.add("transparent");
        setTimeout(function() {
            plusPointsText.classList.remove("clicked");
        }, 500);
        setTimeout(function() {
            plusPointsText.classList.remove("transparent");
        }, 1000);
    }
});

function updateGames(match_id, games) {
    for (var i = 0; i < games.length; i++) {
        if (!games[i].points1) {
            games[i].points1 = "0";
        } 
        if (!games[i].points2) {
            games[i].points2 = "0";
        }
    }
    Matches.update({_id: match_id}, {$set: {games: games}});
}

Template.displayPoints_editable.helpers({
    'isGreater': function(x, y) {
        return greater(x, y);
    },
    'isFirst': function(num) {
        return num == 1;
    },
    'currentGame': function() {
        return Template.currentData().num == Template.parentData(1).games.length;
    }
});

Template.displayPoints_editable.events({ 
    'change .point-input': function(e) {
        var gameNum = Template.currentData().num - 1;
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var games = Matches.findOne({_id: id}).games;
        if (!(new RegExp("^[0-9][0-9]?$")).test(e.target.value)) {
            e.target.value = "0";
            return;
        }
        var points = parseInt(e.target.value);
        if (points < 0) {
            e.target.value = "0";
        } else if (points > 99) {
            e.target.value = "99";
        }
        if (e.target.name == "p1") {
            games[gameNum].points1 = e.target.value;
        } else if (e.target.name == "p2") {
            games[gameNum].points2 = e.target.value;
        }
        updateGames(id, games);
    },
});

Template.displayScore.helpers({
    'playerFromId': function(id) {
        return Meteor.users.findOne({_id: id});
    },
    'p1win': function() {
        var match = Template.parentData(1);
        if (!match.completed) {
            return false;
        }
        return netGames(match) > 0;
    },
    'p2win': function() {
        var match = Template.parentData(1);
        if (!match.completed) {
            return false;
        }
        return netGames(match) < 0;
    },
    'dateString': function() {
        if (!Template.currentData()) {
            return "";
        }
        var date = Template.currentData().date;
        return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
    },
    'first': function(name) {
        return name.charAt(0);
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
        var match = Template.parentData(1);
        var gameNum = Template.currentData().num;
        if (!match || !gameNum) {
            return false;
        }
        return match.completed || gameNum != match.games.length;
    }
});

function netGames(match) {
    var games = match.games;
    var counter = 0;
    if (games != null) {
        for (var i = 0 ; i < games.length; i++) {
            if (greater(games[i].points1, games[i].points2)) {
                counter++;
            } else if (greater(games[i].points2, games[i].points1)) {
                counter--;
            }
        }
    }
    return counter;
}

function greater(x, y) {
    return parseInt(x) > parseInt(y);
}

function boNumFromGames(games) {
    var counter1 = 0;
    var counter2 = 0;
    for (var i = 0; i < games.length; i++) {
        if (greater(games[i].points1, games[i].points2)) {
            counter1++;
        } else {
            counter2++;
        }
    }
    if (counter1 == 0 && counter2 == 0) {
        return 1;
    }
    return counter1 > counter2 ? counter1 * 2 - 1 : counter2 * 2 - 1;
}
