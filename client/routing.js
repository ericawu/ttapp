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