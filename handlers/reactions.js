const fs = require('fs');
const Discord = require('discord.js');
module.exports = client => {
	let amount = 0;
	client.reactions = new Discord.Collection();
	const reactionFiles = fs.readdirSync('./reactions').filter(file => file.endsWith('.js'));
	for (const file of reactionFiles) {
		const reaction = require(`../reactions/${file}`);
		client.reactions.set(reaction.name, reaction);
		amount = amount + 1;
	}
	client.logger.info(`${amount} reactions loaded`);
};