function minTwoDigits(n) { return (n < 10 ? '0' : '') + n; }
const Discord = require('discord.js');
module.exports = {
	name: 'kick',
	description: 'Kick someone from the guild',
	args: true,
	usage: '<User Mention> [Reason]',
	permissions: 'BAN_MEMBERS',
	cooldown: 5,
	guildOnly: true,
	options: [{
		type: 6,
		name: 'user',
		description: 'User to kick',
		required: true,
	},
	{
		type: 3,
		name: 'reason',
		description: 'Reason of kick',
	}],
	async execute(message, args, client) {
		if (message.commandName) args.forEach(arg => args[args.indexOf(arg)] = arg.value);
		if (!message.commandName && !message.mentions.users.first()) return message.reply('Please use a user mention');
		let user = client.users.cache.get(args[0]);
		if (!message.commandName) user = message.mentions.users.first();
		const member = message.guild.members.cache.get(user.id);
		const author = message.member;
		if (member.roles.highest.rawPosition > author.roles.highest.rawPosition) return message.reply('You can\'t do that! Your role is lower than the user\'s role!');
		const Embed = new Discord.MessageEmbed()
			.setColor(Math.round(Math.random() * 16777215));
		if (args[1]) {
			Embed.setTitle(`Kicked ${user.tag} for ${args.join(' ').replace(`${args[0]} `, '')}`);
			await user.send(`**You've been kicked from ${message.guild.name} for ${args.join(' ').replace(`${args[0]} `, '')}**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been kicked.');
			});
		}
		else {
			Embed.setTitle(`Kicked ${user.tag}.`);
			await user.send(`**You've been kicked from ${message.guild.name}.**`).catch(e => {
				message.channel.send('Could not DM user! You may have to manually let them know that they have been kicked.');
			});
		}
		if (message.commandName) message.reply({ embeds: [Embed], ephemeral: true });
		else message.reply(Embed);
		await member.kick().catch(e => message.channel.send(`\`${`${e}`.split('at')[0]}\``));
		const rn = new Date();
		const time = `${minTwoDigits(rn.getHours())}:${minTwoDigits(rn.getMinutes())}:${minTwoDigits(rn.getSeconds())}`;
		console.log(`[${time} INFO]: Kicked user: ${user.tag} from ${message.guild.name}`);
	},
};