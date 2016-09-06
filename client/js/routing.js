Router.configure({
  loadingTemplate: 'loading',
});

Router.route('/profile', {
	waitOn: function() {
		return Meteor.subscribe('allMatches');
	}
});

Router.route('/', {
	template: 'home',
	name: 'home',
	waitOn: function() {
		return Meteor.subscribe('allMatches');
	}
});

Router.route('/newmatch', {
	template: 'newMatch',
	name: 'newmatch'
});

Router.route('/players', {
	template: 'allPlayers', 
	name: 'players'
});