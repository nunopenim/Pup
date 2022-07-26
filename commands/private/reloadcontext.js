const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
module.exports = {
	name: 'reloadcontext',
	description: 'Reloads all context commands',
	async execute(message, args, client) {
		try {
			// Check if user is sab lolololol
			if (message.author.id !== '249638347306303499') return client.error('You can\'t do that!', message, true);
			if (!client.application?.owner) await client.application?.fetch();
			const commands = await client.application?.commands.fetch();
			const msg = await message.channel.send('Updating context menu commands...');
			for (let command of commands) {
				command = command[1];
				if (client.slashcommands.find(c => c.name == command.name)) continue;
				await msg.edit(`Deleting ${command.name}`);
				await command.delete();
				await msg.edit(`Deleted ${command.name}`);
				await sleep(4000);
			}
			for (let command of client.slashcommands) {
				command = command[1];
				if (!command.type) continue;
				await msg.edit(`Overwriting ${command.name}`);
				const cmd = new ContextMenuCommandBuilder()
					.setName(command.name)
					.setType(ApplicationCommandType[command.type]);
				await client.application?.commands.create(cmd.toJSON());
				await msg.edit(`Overwritten ${command.name}`);
				await sleep(4000);
			}
			await msg.edit('Done!');
			await message.reply('All context menu commands have been updated!');
		}
		catch (err) { client.error(err, message); }
	},
};