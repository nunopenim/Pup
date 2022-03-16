const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { x, o, empty, refresh } = require('../../lang/int/emoji.json');
const msg = require('../../lang/en/msg.json');
const evalXO = require('../../functions/evalXO.js');
const again = new ActionRowBuilder()
	.addComponents(new ButtonBuilder()
		.setCustomId('xo_again')
		.setEmoji({ id: refresh })
		.setLabel('Play Again')
		.setStyle(ButtonStyle.Secondary),
	);
module.exports = {
	name: 'tictactoe',
	description: 'Play Tic Tac Toe with an opponent',
	aliases: ['xo'],
	args: true,
	usage: '<Opponent User>',
	cooldown: 10,
	options: require('../options/user.json'),
	async execute(message, args, client) {
		const user = message.guild.members.cache.get(args[0].replace(/\D/g, ''));
		if (!user) return client.error(msg.invalidmember, message, true);
		if (user.id == message.member.id) return client.error('You played yourself, oh wait, you can\'t.', message, true);
		let turn = Math.round(Math.random());
		const btns = {};
		const rows = [];
		for (let row = 1; row <= 3; row++) {
			rows.push(new ActionRowBuilder());
			for (let column = 1; column <= 3; column++) {
				btns[`${column}${row}`] = new ButtonBuilder()
					.setCustomId(`${column}${row}`)
					.setEmoji({ id: empty })
					.setStyle(ButtonStyle.Secondary);
				rows[row - 1].addComponents(btns[`${column}${row}`]);
			}
		}
		const TicTacToe = new EmbedBuilder()
			.setColor(turn ? 0xff0000 : 0x0000ff)
			.setTitle('Tic Tac Toe')
			.setFields({ name: `${turn ? 'X' : 'O'}'s turn`, value: `${turn ? message.member : user}` })
			.setThumbnail(turn ? message.member.user.avatarURL() : user.user.avatarURL())
			.setDescription(`**X:** ${message.member}\n**O:** ${user}`);

		const xomsg = await message.reply({ content: `${turn ? message.member : user}`, embeds: [TicTacToe], components: rows });

		const collector = xomsg.createMessageComponentCollector({ time: 3600000 });

		collector.on('collect', async interaction => {
			if (interaction.customId == 'xo_again') return;
			if (interaction.user.id != (turn ? message.member.id : user.id)) return interaction.reply({ content: 'It\'s not your turn!', ephemeral: true });
			interaction.deferUpdate();
			const btn = btns[interaction.customId];
			if (btn.toJSON().style == ButtonStyle.Secondary) {
				btn.setStyle(turn ? ButtonStyle.Danger : ButtonStyle.Primary)
					.setEmoji({ id: turn ? x : o })
					.setDisabled(true);
			}
			turn = !turn;
			TicTacToe.setColor(turn ? 0xff0000 : 0x0000ff)
				.setFields({ name: `${turn ? 'X' : 'O'}'s turn`, value: `${turn ? message.member : user}` })
				.setThumbnail(turn ? message.member.user.avatarURL() : user.user.avatarURL());
			// 2 = empty / 4 = X / 1 = O
			const reslist = Object.keys(btns).map(i => { return `${btns[i].toJSON().style}`; });

			// Evaluate the board
			const win = evalXO(reslist);
			if (win.rows) win.rows.forEach(i => btns[i].setStyle(ButtonStyle.Success));
			if (win.winner) {
				const xwin = win.winner == 'x';
				Object.keys(btns).map(i => { btns[i].setDisabled(true); });
				TicTacToe.setColor(xwin ? 0xff0000 : 0x0000ff)
					.setFields({ name: 'Result:', value: `${xwin ? message.member : user} wins!` })
					.setThumbnail(xwin ? message.member.user.avatarURL() : user.user.avatarURL());
				rows.push(again);
				xomsg.edit({ content: `${xwin ? message.member : user}`, embeds: [TicTacToe], components: rows, allowedMentions: { repliedUser: xwin } });
				return collector.stop();
			}

			// check for draw
			let draw = true;
			Object.keys(btns).map(i => { if (!btns[i].toJSON().disabled) draw = false; });
			if (draw) {
				TicTacToe.setColor(0xff00ff)
					.setFields({ name: 'Result:', value: 'Draw!' })
					.setThumbnail();
				rows.push(again);
				return xomsg.edit({ content: null, embeds: [TicTacToe], components: rows }) && collector.stop();
			}

			// Go on to next turn if no matches
			xomsg.edit({ content: `${turn ? message.member : user}`, embeds: [TicTacToe], components: rows, allowedMentions: { repliedUser: turn } });
		});

		collector.on('end', () => {
			if (TicTacToe.toJSON().fields[0].name == 'Result:') return;
			xomsg.edit({ content: 'A game of tic tac toe should not last longer than an hour are you high', components: [], embeds: [] });
		});
	},
};