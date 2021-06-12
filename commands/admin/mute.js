const Discord = require('discord.js');
module.exports = {
	name: 'mute',
	description: 'Mute someone from the guild',
	args: true,
	usage: '<User> [Reason]',
	permissions: 'BAN_MEMBERS',
	cooldown: 5,
	guildOnly: true,
	options: [{
		type: 6,
		name: 'user',
		description: 'User to mute',
		required: true,
	},
	{
		type: 3,
		name: 'time',
		description: 'Amount of time to mute in minutes',
	},
	{
		type: 3,
		name: 'reason',
		description: 'Reason of mute',
	}],
	async execute(message, args, client) {
		const srvconfig = client.settings.get(message.guild.id);
		if (srvconfig.mutecmd == 'false') return message.reply('This command is disabled!');
		if (srvconfig.muterole == 'Not Set') return message.reply('Please set a mute role with -settings muterole <Role ID>! Make sure the role is above every other role and Pup\'s role is above the mute role, or else it won\'t work!');
		if (message.type && message.type == 'APPLICATION_COMMAND') {
			args = Array.from(args);
			args.forEach(arg => args[args.indexOf(arg)] = arg[1].value);
		}
		if (!message.commandName && !message.mentions.users.first()) return message.reply('Please use a user mention');
		let user = client.users.cache.get(args[0]);
		if (!message.commandName) user = message.mentions.users.first();
		const member = message.guild.members.cache.get(user.id);
		const author = message.member;
		if (member.roles.highest.rawPosition > author.roles.highest.rawPosition) return message.reply('You can\'t do that! Your role is lower than the user\'s role!');
		const Embed = new Discord.MessageEmbed()
			.setColor(Math.round(Math.random() * 16777215));
		if (!isNaN(args[1]) && args[2]) {
			Embed.setTitle(`Muted ${user.tag} for ${args[1]} minutes. Reason: ${args.slice(2).join(' ')}`);
			await user.send(`**You've been muted on ${message.guild.name} for ${args[1]} minutes. Reason: ${args.slice(2).join(' ')}**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been muted.');
			});
			client.logger.info(`Muted user: ${user.tag} on ${message.guild.name} for ${args[1]} minutes. Reason: ${args.slice(2).join(' ')}`);
		}
		else if (!isNaN(args[1])) {
			Embed.setTitle(`Muted ${user.tag} for ${args[1]} minutes.`);
			await user.send(`**You've been muted on ${message.guild.name} for ${args[1]} minutes.**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been muted.');
			});
			client.logger.info(`Muted user: ${user.tag} on ${message.guild.name} for ${args[1]} minutes`);
		}
		else if (args[1]) {
			Embed.setTitle(`Muted ${user.tag} for ${args.slice(1).join(' ')}`);
			await user.send(`**You've been muted on ${message.guild.name} for ${args.slice(1).join(' ')}**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been muted.');
			});
			client.logger.info(`Muted user: ${user.tag} on ${message.guild.name} for ${args.slice(1).join(' ')} forever`);
		}
		else {
			Embed.setTitle(`Muted ${user.tag} forever.`);
			await user.send(`**You've been muted on ${message.guild.name} forever.**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been muted.');
			});
			client.logger.info(`Muted user: ${user.tag} on ${message.guild.name} forever`);
		}
		const role = await message.guild.roles.cache.get(srvconfig.muterole);
		if (!member.roles.cache.has(role.id)) {
			await member.roles.add(role);
		}
		else {
			await member.roles.remove(role);
		}
		if (message.commandName) message.reply({ embeds: [Embed], ephemeral: true });
		else message.reply(Embed);
	},
};