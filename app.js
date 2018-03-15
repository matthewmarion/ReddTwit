'use strict';
require('dotenv').load();
const twit = require('twit');
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm');
const config = require('./config.js');
const twitter = new twit(config);

const reddit = new snoowrap({
	userAgent: process.env.USER_AGENT,
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	username: process.env.REDDIT_USER,
	password: process.env.REDDIT_PASS
});

const client = new snoostorm(reddit);

const redditStream = client.SubmissionStream({
	subreddit: process.env.SUBREDDIT,
	results: 1
});

redditStream.on('submission', function(post) {
	console.log('New submission by ' + post.author.name + " - " + post.url);
	postTweet(post.author.name, post.title, post.url);
});

const postTweet = function(author, title, url) {
	let tweetText = titleEndsInPeriod(title) ? 
	title + ' Post by ' + author + '. Read more: ' + url : 
	title + '. Post by ' + author + '. Read more: ' + url;
	
	twitter.post('statuses/update',
	{
		status: tweetText,
		function(err, data, response) {
			if (err) {
				console.log("Error : " + err);
			}
		}
	});
};

let titleEndsInPeriod = function(title) {
	if (title.toString().substr(title.length - 1) === '.') {
		return true;
	} 
	return false;
};
