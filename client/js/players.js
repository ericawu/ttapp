Template.players_page.helpers({
    allPlayers: function() {        
        return Meteor.users.find({}, {sort: {"profile.rating": -1}}).map(function(player, index) {
            player.profile.rank = index+1;
            return player;
        });
    }
});