const { schedule } = require('node-cron');
const { EmbedBuilder } = require('discord.js');

module.exports = async client => {
	schedule('* * * * *', async () => {
		// Get all member data
		const memberdata = await client.getData('memberdata', null, { all: true });

		// Iterate through every row in the data
		for (const data of memberdata) {
			// Check if member has any ban or mute
			if (!data.mutedUntil && !data.bannedUntil) continue;

			// Get the guild from the guildId
			const guild = await client.guilds.fetch(data.guildId).catch(() => { return null; });
			if (!guild) continue;

			// Get the guild config
			const srvconfig = await client.getData('settings', { guildId: guild.id });

			// Get the member from the memberId, and user just in case member is invalid
			const member = await guild.members.fetch(data.memberId).catch(() => { return null; });
			const user = await client.users.fetch(data.memberId).catch(() => { return null; });

			if (data.mutedUntil && data.mutedUntil < Date.now()) {
				// Get the role and if it exists get rid of it from the member
				const role = await guild.roles.cache.get(srvconfig.mutecmd);
				if (role && member) await member.roles.remove(role);

				// Send the unmute message to the member if it was fetched properly
				if (user) user.send({ content: `**You have been unmuted in ${guild.name}**` }).catch(err => logger.warn(err));
				logger.info(`Unmuted ${user ? user.tag : data.memberId} in ${guild.name}`);

				// Set the data
				await client.setData('memberdata', { memberId: data.memberId, guildId: guild.id }, { mutedUntil: null });

				// Check if log channel exists and send message
				const logchannel = guild.channels.cache.get(srvconfig.logchannel);
				if (logchannel) {
					const UnmuteEmbed = new EmbedBuilder().setTitle(`${user ? user.tag : data.memberId} has been unmuted`);
					logchannel.send({ embeds: [UnmuteEmbed] });
				}
			}
			if (data.bannedUntil && data.bannedUntil < Date.now()) {
				// Attempt to unban the member
				await guild.members.unban(data.memberId).catch(err => logger.error(err));

				// Send the unban message to the member if it was fetched properly
				if (user) user.send({ content: `**You've been unbanned in ${guild.name}**` }).catch(err => logger.warn(err));
				logger.info(`Unbanned ${user ? user.tag : data.memberId} in ${guild.name}`);

				// Set the data
				await client.setData('memberdata', { memberId: data.memberId, guildId: guild.id }, { bannedUntil: null });

				// Check if log channel exists and send message
				const logchannel = guild.channels.cache.get(srvconfig.logchannel);
				if (logchannel) {
					const UnbanEmbed = new EmbedBuilder().setTitle(`${user ? user.tag : data.memberId} has been unbanned`);
					logchannel.send({ embeds: [UnbanEmbed] });
				}
			}
		}
	});
};