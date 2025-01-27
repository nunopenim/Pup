module.exports = async (client, guild) => {
	if (!guild.available) return;
	const player = client.manager.get(guild.id);
	if (player) player.destroy();
	client.delData('settings', { guildId: guild.id });
	client.delData('reactionroles', { guildId: guild.id });
	client.delData('memberdata', { guildId: guild.id });
	client.delData('ticketdata', { guildId: guild.id });
	logger.info(`${client.user.username} has been removed from ${guild.name}`);
};