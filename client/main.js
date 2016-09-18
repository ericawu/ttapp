import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('topUsers');
Meteor.subscribe('allUsers');
Meteor.subscribe('allMatches');