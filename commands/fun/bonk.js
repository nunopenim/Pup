const { Embed } = require('discord.js');
module.exports = {
	name: 'bonk',
	description: 'Bonk someone!',
	usage: '[Someone]',
	options: require('../options/someone.json'),
	async execute(message, args, client) {
		try {
			// Check if arg is a user and set it
			if (args[0]) {
				const user = client.users.cache.get(args[0].replace(/\D/g, ''));
				if (user) args[0] = user;
			}

			// Create embed with bonk gif and author / footer
			const BonkEmbed = new Embed()
				.setAuthor({ name: `${message.member.displayName} bonks ${args[0] ? args[0].username ? args[0].username : args.join(' ') : 'themselves'}`, iconURL: message.member.user.avatarURL() })
				.setImage('https://c.tenor.com/TbLpG9NCzjkAAAAC/bonk.gif')
				.setFooter({ text: 'get bonked' });

			// Reply with bonk message, if user is set then mention the user
			message.reply({ content: args[0].username ? args[0] : null, embeds: [BonkEmbed] });
		}
		catch (err) {
			client.error(err, message);
		}
	},
};