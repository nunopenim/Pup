const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection } = require('discord.js');
const { no } = require('../../lang/int/emoji.json');
const getTranscript = require('../../functions/getTranscript.js');
const getMessages = require('../../functions/getMessages.js');
const checkPerms = require('../../functions/checkPerms');

module.exports = {
	name: 'deny',
	description: 'Deny a suggestion.',
	ephemeral: true,
	aliases: ['reject', 'decline'],
	args: true,
	permissions: ['Administrator'],
	usage: '<Message Id> [Response]',
	options: require('../../options/suggestresponse.js'),
	async execute(message, args, client) {
		try {
			// Get the messageId
			const messageId = args.shift();

			// Fetch the message with the messageId
			let suggestChannel = message.channel;
			const permCheck = checkPerms(['ReadMessageHistory'], message.guild.members.me, suggestChannel);
			if (permCheck) return client.error(permCheck, message, true);
			let suggestMsg = await suggestChannel.messages.fetch(messageId).catch(() => { return null; });

			// Get server config
			const srvconfig = await client.getData('settings', { guildId: message.guild.id });

			// If the suggestmsg is null, try checking for the message in the suggestionchannel if set
			if (!suggestMsg) {
				suggestChannel = message.guild.channels.cache.get(srvconfig.suggestionchannel);
				if (suggestChannel) {
					const permCheck2 = checkPerms(['ReadMessageHistory'], message.guild.members.me, suggestChannel);
					if (permCheck2) return client.error(permCheck2, message, true);
					suggestMsg = await suggestChannel.messages.fetch(messageId).catch(() => { return null; });
				}
			}

			// If the suggestmsg is still null, try checking for the message in the thread's channel
			if (!suggestMsg && message.channel.parent && message.channel.parent.type == ChannelType.GuildText) {
				suggestChannel = message.channel.parent;
				const permCheck2 = checkPerms(['ReadMessageHistory'], message.guild.members.me, suggestChannel);
				if (permCheck2) return client.error(permCheck2, message, true);
				suggestMsg = await suggestChannel.messages.fetch(messageId).catch(() => { return null; });
			}

			// If the suggestmsg is still null, throw an error
			if (!suggestMsg) return client.error('Could not find the message.\nTry doing the command in the same channel as the suggestion.', message, true);

			// Check if message was sent by the bot
			if (suggestMsg.author.id != client.user.id) return;

			// Get embed and check if embed is a suggestion
			const DenyEmbed = new EmbedBuilder(suggestMsg.embeds[0].toJSON());
			if (!DenyEmbed || !DenyEmbed.toJSON().author || !DenyEmbed.toJSON().title.startsWith('Suggestion')) return;

			// Delete command message
			if (!message.commandName) await message.delete().catch(err => logger.error(err));

			// Remove all reactions and set color to red and denied title
			const permCheck2 = checkPerms(['ManageMessages'], message.guild.members.me, suggestChannel);
			if (permCheck2) return client.error(permCheck2, message, true);
			suggestMsg.reactions.removeAll();
			DenyEmbed.setColor(0xE74C3C)
				.setTitle('Suggestion (Denied)')
				.setFooter({ text: `Denied by ${message.member.user.tag}`, iconURL: message.member.user.avatarURL() })
				.setTimestamp();

			// Fetch result / reaction emojis and add field if not already added
			const emojis = [];
			await suggestMsg.reactions.cache.forEach(reaction => {
				let emoji = client.emojis.cache.get(reaction._emoji.id);
				if (!emoji) emoji = reaction._emoji.name;
				emojis.push(`${emoji} **${reaction.count}**`);
			});
			if (!DenyEmbed.toJSON().fields && emojis.length) DenyEmbed.addFields([{ name: 'Results', value: `${emojis.join(' ')}` }]);

			// Get suggestion thread
			const thread = message.guild.channels.cache.get(DenyEmbed.toJSON().url.split('a')[2]);

			// Delete thread if exists with transcript
			if (thread) {
				const permCheck3 = checkPerms(['ManageThreads'], message.guild.members.me, suggestChannel);
				if (permCheck3) return client.error(permCheck3, message, true);
				const messagechunks = await getMessages(thread, 'infinite').catch(err => { logger.error(err); });
				messagechunks.unshift(new Collection().set(`${suggestMsg.id}`, suggestMsg));
				const allmessages = new Collection().concat(...messagechunks);
				if (allmessages.size > 2) {
					const link = await getTranscript(allmessages);
					DenyEmbed.addFields([{ name: 'View Discussion', value: link }]);
				}
				thread.delete();
			}

			// Check if there's a message and put in new field
			if (args.join(' ')) {
				// check if there's a response already, if so, edit the field and don't add a new field
				const field = DenyEmbed.toJSON().fields ? DenyEmbed.toJSON().fields.find(f => f.name == 'Response') : null;
				if (field) field.value = args.join(' ');
				else DenyEmbed.addFields([{ name: 'Response', value: args.join(' ') }]);
			}

			// Send deny dm to op
			if (DenyEmbed.toJSON().url) {
				const member = message.guild.members.cache.get(DenyEmbed.toJSON().url.split('a')[1]);
				const row = new ActionRowBuilder().addComponents([
					new ButtonBuilder()
						.setURL(suggestMsg.url)
						.setLabel('Go to suggestion')
						.setStyle(ButtonStyle.Link),
				]);
				if (member) {
					member.send({ content: `**Your suggestion at ${message.guild.name} has been denied.**${args.join(' ') ? `\nResponse: ${args.join(' ')}` : ''}`, components: [row] })
						.catch(err => logger.warn(err));
				}
			}

			// Update message and reply with denied
			await suggestMsg.edit({ embeds: [DenyEmbed] });
			if (message.commandName) message.reply({ content: `<:no:${no}> **Suggestion Denied!**` }).catch(() => { return null; });

			// Check if log channel exists and send message
			const logChannel = message.guild.channels.cache.get(srvconfig.logchannel);
			if (logChannel) {
				DenyEmbed.setTitle(`${message.member.user.tag} denied a suggestion`).setFields([]);
				if (args.join(' ')) DenyEmbed.addFields([{ name: 'Response', value: args.join(' ') }]);
				const msglink = new ActionRowBuilder()
					.addComponents([new ButtonBuilder()
						.setURL(suggestMsg.url)
						.setLabel('Go to Message')
						.setStyle(ButtonStyle.Link),
					]);
				logChannel.send({ embeds: [DenyEmbed], components: [msglink] });
			}
		}
		catch (err) { client.error(err, message); }
	},
};