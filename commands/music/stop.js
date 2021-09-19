const { MessageEmbed } = require('discord.js');
const { stop } = require('../../config/emoji.json');
module.exports = {
	name: 'stop',
	description: 'Stops the music',
	cooldown: 10,
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
		const autoplay = player.get('autoplay');
		if (autoplay === true) {
			player.set('autoplay', false);
		}
		player.stop();
		player.queue.clear();
		const thing = new MessageEmbed()
			.setColor(message.client.embedColor)
			.setTimestamp()
			.setDescription(`${stop} Stopped the music`);
		message.reply({ embeds: [thing] });
	},
};