const { MessageEmbed } = require('discord.js');
const { shuffle } = require('../../config/emoji.json');
module.exports = {
	name: 'shuffle',
	description: 'Shuffle queue',
	player: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	async execute(message) {
		const player = message.client.manager.get(message.guild.id);
		if (!player.queue.current) {
			const thing = new MessageEmbed()
				.setColor('RED')
				.setDescription('There is no music playing.');
			return message.reply({ embeds: [thing] });
		}
		player.queue.shuffle();
		const thing = new MessageEmbed()
			.setDescription(`${shuffle} Shuffled the queue`)
			.setColor(message.client.embedColor)
			.setTimestamp();
		return message.reply({ embeds: [thing] }).catch(error => message.client.logger.error(error));
	},
};