const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
module.exports = async function createVoice(client, srvconfig, member, channel) {
	// Check if channel is thread and set the channel to the parent channel
	if (channel.isThread()) channel = channel.parent;

	// Check if channel is a ticket
	const ticketData = (await client.query(`SELECT * FROM ticketdata WHERE channelId = '${channel.id}'`))[0];
	if (!ticketData) throw new Error('This isn\'t a ticket that I know of!');
	if (ticketData.users) ticketData.users = ticketData.users.split(',');

	// Check if ticket is closed
	if (channel.name.startsWith('closed')) throw new Error('This ticket is closed!');

	// Check if ticket already has a voiceticket
	if (ticketData.voiceticket != 'false') throw new Error('This ticket already has a voiceticket!');

	// Find category and if no category then set it to null
	const parent = channel.guild.channels.cache.get(srvconfig.ticketcategory);

	// Branch for ticket-dev or ticket-testing etc
	const branch = client.user.username.split(' ')[1] ? `-${client.user.username.split(' ')[1].toLowerCase()}` : '';

	// Create voice channel for voiceticket
	const author = channel.guild.members.cache.get(ticketData.opener);
	const voiceticket = await channel.guild.channels.create({
		name: `Voiceticket${branch} ${author.displayName}`,
		type: ChannelType.GuildVoice,
		parent: parent ? parent.id : null,
		permissionOverwrites: [
			{
				id: channel.guild.id,
				deny: [PermissionsBitField.Flags.ViewChannel],
			},
			{
				id: client.user.id,
				allow: [PermissionsBitField.Flags.ViewChannel],
			},
			{
				id: author.id,
				allow: [PermissionsBitField.Flags.ViewChannel],
			},
		],
	});

	// Add permissions for each user in the voiceticket
	await ticketData.users.forEach(userid => voiceticket.permissionOverwrites.edit(userid, { ViewChannel: true }));

	// Find role and add their permissions to the channel
	const role = channel.guild.roles.cache.get(srvconfig.supportrole);
	if (role) voiceticket.permissionOverwrites.edit(role.id, { ViewChannel: true });

	// Add voiceticket to ticket database
	await client.setData('ticketdata', 'channelId', channel.id, 'voiceticket', voiceticket.id);

	// Create embed for log
	const VCEmbed = new EmbedBuilder()
		.setColor(0xFF6400)
		.setDescription(`Voiceticket created by ${member}`);
	await channel.send({ embeds: [VCEmbed] });

	// Log
	logger.info(`Voiceticket created at #${voiceticket.name}`);
	return `**Voiceticket created at ${voiceticket}!**`;
};