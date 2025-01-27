const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'reactions',
	description: 'See what words Cactie reacts to',
	voteOnly: true,
	ephemeral: true,
	cooldown: 10,
	execute(message, args, client) {
		try {
			const ReactionEmbed = new EmbedBuilder()
				.setColor('Random')
				.setTitle('Here are my reactions');
			client.reactions.forEach(reaction => {
				ReactionEmbed.addFields([{ name: `${reaction.name}${reaction.description ? `, ${reaction.description}` : ''}`, value: `${reaction.additionaltriggers ? `${reaction.additionaltriggers}\n` : ''}${reaction.triggers}` }]);
			});
			message.reply({ embeds: [ReactionEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};