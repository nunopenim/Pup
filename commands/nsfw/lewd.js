module.exports = {
	name: 'lewd',
	async execute(message, args, client) {
		require('../../functions/redditFetch.js')('lewd', message, client);
	},
};