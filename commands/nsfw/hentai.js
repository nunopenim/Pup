module.exports = {
	name: 'hentai',
	description: 'nsfw',
	async execute(message, args, client) {
		require('../private/redditfetch_noslash.js')('hentai', message, client);
	},
};