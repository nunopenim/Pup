const Discord = require('discord.js');
module.exports = {
	name: 'ban',
	description: 'Ban someone from the guild',
	args: true,
	usage: '<User> [Reason]',
	permissions: 'BAN_MEMBERS',
	cooldown: 5,
	guildOnly: true,
	options: [{
		type: 6,
		name: 'user',
		description: 'User to ban',
		required: true,
	},
	{
		type: 3,
		name: 'reason',
		description: 'Reason of ban',
	}],
	async execute(message, args, client) {
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
		if (args[1]) {
			Embed.setTitle(`Banned ${user.tag} for ${args.slice(1).join(' ')}`);
			await user.send(`**You've been banned from ${message.guild.name} for ${args.slice(1).join(' ')}**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been banned.');
			});
		}
		else {
			Embed.setTitle(`Banned ${user.tag}.`);
			await user.send(`**You've been banned from ${message.guild.name}.**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been banned.');
			});
		}
		if (message.commandName) message.reply({ embeds: [Embed], ephemeral: true });
		else message.reply(Embed);
		await member.ban({ reason: `Banned by ${message.member.user.tag} for ${args.slice(1).join(' ')}` }).catch(e => message.channel.send(`\`${`${e}`.split('at')[0]}\``));
		client.logger.info(`Banned user: ${user.tag} from ${message.guild.name}`);
	},
};