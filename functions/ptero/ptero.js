const { NodeactylClient } = require('nodeactyl');
const fs = require('fs');
const YAML = require('yaml');
const { servers } = YAML.parse(fs.readFileSync('./pterodactyl.yml', 'utf8'));
function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const pteroUpdate = require('./pteroUpdate.js');
module.exports = async function ptero(interaction, client, action) {
	const server = servers.find(srv => interaction.message.embeds[0].url.split('server/')[1] == srv.id);
	if (!client.guilds.cache.get(server.guildid).members.cache.get(interaction.member.id)
    || !client.guilds.cache.get(server.guildid).members.cache.get(interaction.member.id).roles.cache.has(server.roleid)) {
		return interaction.user.send({ content: 'You can\'t do that!' })
			.catch(err => client.logger.warn(err));
	}
	const Client = new NodeactylClient(server.url, server.apikey);
	if (action == 'start') Client.startServer(server.id);
	else if (action == 'restart') Client.restartServer(server.id);
	else if (action == 'stop') Client.stopServer(server.id);
	else if (action == 'kill') Client.killServer(server.id);
	client.logger.info(`${action}ing ${server.name}`);
	pteroUpdate(interaction, Client);
	sleep(20000);
	pteroUpdate(interaction, Client);
};