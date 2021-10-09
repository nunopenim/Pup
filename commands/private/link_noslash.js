const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
module.exports = {
	name: 'link',
	cooldown: 10,
	async execute(message) {
		let e = [];
		if (message.guild.id == '865519986806095902') e = ['Warden', '661797951223627787', 'Nether Depths'];
		if (message.guild.id == '711661870926397601') e = ['Taco\'s Turtle Bot', '743741294190395402', 'Taco Haven'];
		if (!e[0]) return;
		const Embed = new MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777215))
			.setTitle('DISCORD LINKING')
			.setDescription(`**Follow these steps to link your Discord and Minecraft accounts**
**1.** If you are not already on the server, join it.
**2.** Use the command \`/discord link\` in-game.
**3.** Click here -> <@${e[1]}>
**4.** Enter the 4 digit code in the box that reads \`Message @${e[0]}\`
**5.** Hit enter. Your account should now be linked!

**Having Trouble?**
If after step 3, you do not see a box that says \`Message @${e[0]}\`, you disabled direct messages from server members. To turn this back on, follow the steps below:
**1.** On your list of Discord servers in the left-hand servers tab, you should see the ${e[2]} logo. Right click it.
**2.** Click Privacy \`Settings\`
**3.** Enable the setting labeled \`Allow direct messages from server members\`.`);
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('create_ticket')
					.setLabel('Still have an issue? Create a ticket by clicking here!')
					.setStyle('SECONDARY'),
			);
		message.reply({ embeds: [Embed], components: [row] });
	},
};
