const { EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'mute',
	description: 'Mute someone in the server',
	ephemeral: true,
	args: true,
	usage: '<User @ or Id> [Time] [Reason]',
	permissions: ['ModerateMembers'],
	botPerms: ['ManageRoles', 'ModerateMembers'],
	cooldown: 5,
	options: require('../../options/punish.js'),
	async execute(message, args, client, lang) {
		try {
			// Get mute role and check if role is valid
			const srvconfig = await client.getData('settings', { guildId: message.guild.id });
			const role = await message.guild.roles.cache.get(srvconfig.mutecmd);
			if (!role && srvconfig.mutecmd != 'timeout') return client.error('This command is disabled!', message, true);

			// Get user and check if user is valid
			let member = message.guild.members.cache.get(args[0].replace(/\D/g, ''));
			if (!member) member = await message.guild.members.fetch(args[0].replace(/\D/g, ''));
			if (!member) return client.error(lang.invalidmember, message, true);

			// Get author and check if role is lower than member's role
			const author = message.member;
			if (member.roles.highest.rawPosition > author.roles.highest.rawPosition) return client.error(`You can't do that! Your role is ${member.roles.highest.rawPosition - author.roles.highest.rawPosition} positions lower than the user's role!`, message, true);
			if (member.roles.highest.rawPosition > message.guild.members.me.roles.highest.rawPosition) return client.error(`I can't do that! My role is ${member.roles.highest.rawPosition - message.guild.members.me.roles.highest.rawPosition} positions lower than the user's role!`, message, true);

			// Check if user is muted
			if (role && member.roles.cache.has(role.id)) return client.error('This user is already muted! Try unmuting instead.', message, true);

			// Check if duration is set and if it's more than a year
			const time = ms(args[1] ? args[1] : 'perm');
			if (role && time > 31536000000) return client.error('You cannot mute someone for more than 1 year!', message, true);

			// Timeout feature can't mute someone for more than 30 days
			else if (time > 2592000000) return client.error('You cannot mute someone for more than 30 days with the timeout feature turned on!', message, true);
			if (isNaN(time) && srvconfig.mutecmd == 'timeout') return client.error('You cannot mute someone forever with the timeout feature turned on!', message, true);

			// Create embed and check if duration / reason are set and do stuff
			const MuteEmbed = new EmbedBuilder()
				.setColor('Random')
				.setTitle(`Muted ${member.user.tag} ${!isNaN(time) ? `for ${args[1]}` : 'forever'}.`);

			// Add reason if specified
			const reason = args.slice(!isNaN(time) ? 2 : 1).join(' ');
			if (reason) MuteEmbed.addFields([{ name: 'Reason', value: reason }]);

			// Actually mute the dude (add role)
			if (role) await member.roles.add(role);
			else await member.timeout(time, `Muted by ${author.user.tag} for ${args.slice(1).join(' ')}`);

			// Set member data for unmute time if set
			if (!isNaN(time)) client.setData('memberdata', { memberId: member.id, guildId: message.guild.id }, { mutedUntil: Date.now() + time });

			// Send mute message to target
			await member.send({ content: `**You've been muted in ${message.guild.name} ${!isNaN(time) ? `for ${args[1]}` : 'forever'}.${reason ? ` Reason: ${reason}` : ''}**` })
				.catch(err => {
					logger.warn(err);
					message.reply({ content: 'Could not DM user! You may have to manually let them know that they have been banned.' });
				});
			logger.info(`Muted user: ${member.user.tag} in ${message.guild.name} ${!isNaN(time) ? `for ${args[1]}` : 'forever'}.${reason ? ` Reason: ${reason}` : ''}`);

			// Reply to command
			await message.reply({ embeds: [MuteEmbed] });

			// Check if log channel exists and send message
			const logchannel = message.guild.channels.cache.get(srvconfig.logchannel);
			if (logchannel) {
				MuteEmbed.setTitle(`${author.user.tag} ${MuteEmbed.toJSON().title}`);
				logchannel.send({ embeds: [MuteEmbed] });
			}
		}
		catch (err) { client.error(err, message); }
	},
};