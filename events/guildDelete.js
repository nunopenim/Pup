const { MessageEmbed } = require('discord.js');
module.exports = async (client, guild) => {
	client.delData('settings', 'guildId', guild.id);
	client.logger.info(`${client.user.username} has been removed from ${guild.name}`);
	const owner = await guild.fetchOwner();
	const timestamp = Math.round(guild.createdTimestamp / 1000);
	const Embed = new MessageEmbed()
		.setColor(Math.floor(Math.random() * 16777215))
		.setTitle(`${client.user.username} has been removed from ${guild.name}`)
		.setThumbnail(guild.iconURL({ dynamic : true }))
		.setFooter({ text: `Owner: ${owner.user.username}`, iconURL: owner.user.avatarURL({ dynamic : true }) })
		.addField('Created At', `<t:${timestamp}>\n<t:${timestamp}:R>`);
	client.guilds.cache.get('811354612547190794').channels.cache.get('865682839616618506').send({ embeds: [Embed] });
};