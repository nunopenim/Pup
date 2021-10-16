const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'bonk',
	description: 'Bonk someone!',
	usage: '[Someone]',
	options: require('../options/someone.json'),
	async execute(message, args, client) {
		let user = null;
		if (client.users.cache.get(args[0].replace('<@', '').replace('!', '').replace('>', ''))) {
			user = client.users.cache.get(args[0].replace('<@', '').replace('!', '').replace('>', ''));
			args[0] = user.username;
		}
		const Embed = new MessageEmbed()
			.setAuthor(`${message.member.displayName} bonks ${args[0] ? args.join(' ') : 'themselves'}`, message.member.user.avatarURL())
			.setImage('https://c.tenor.com/TbLpG9NCzjkAAAAC/bonk.gif')
			.setFooter('get bonked');
		message.reply({ content: user ? `${user}` : null, embeds: [Embed] });
	},
};