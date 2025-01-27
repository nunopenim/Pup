const { EmbedBuilder } = require('discord.js');
const { no } = require('../../lang/int/emoji.json');

module.exports = async (client, channel) => {
	// Get current settings for the guild
	const srvconfig = await client.getData('settings', { guildId: channel.guild.id });

	// Check if log is enabled and send log
	if (!['channeldelete', 'channel', 'all'].some(logtype => srvconfig.auditlogs.split(',').includes(logtype))) return;
	const logchannel = channel.guild.channels.cache.get(srvconfig.logchannel);
	if (!logchannel) return;

	// Convert createdTimestamp into seconds
	const createdTimestamp = Math.round(channel.createdTimestamp / 1000);

	// Create log embed
	const logEmbed = new EmbedBuilder()
		.setColor(0x2f3136)
		.setAuthor({ name: `# ${channel.name}` })
		.setTitle(`<:no:${no}> Channel deleted`)
		.setFields([{ name: 'Created at', value: `<t:${createdTimestamp}>\n<t:${createdTimestamp}:R>`, inline: true }]);

	// Add category and topic if applicable
	if (channel.parent) logEmbed.addFields([{ name: 'Category', value: `${channel.parent}`, inline: true }]);
	if (channel.topic) logEmbed.addFields([{ name: 'Topic', value: channel.topic, inline: true }]);

	// Send log
	logchannel.send({ embeds: [logEmbed] }).catch(err => logger.error(err));
};