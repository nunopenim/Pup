const { NodeactylClient } = require('nodeactyl');
const pteroUpdate = require('../functions/ptero/ptero.js');
const servers = require('../config/pterodactyl.json');
module.exports = {
	name: 'ptero_update',
	async execute(interaction, client) {
		interaction.reply = interaction.editReply;
		try {
			// Convert servers to array and find the server by id
			const srvs = Object.keys(servers).map(i => { return servers[i]; });
			const server = srvs.find(srv => interaction.message.embeds[0].url.split('server/')[1] == srv.id);

			// Create a nodeactyl client from creds provided because the function doesn't do it
			const Client = new NodeactylClient(server.url, server.apikey);
			// Call the pteroUpdate function
			pteroUpdate(interaction, Client);
		}
		catch (err) {
			client.error(err, interaction);
		}
	},
};