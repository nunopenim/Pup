module.exports = {
	name: 'trap',
	async execute(message, args, client) {
		require('../../functions/redditFetch.js')('traps', message, client);
	},
};