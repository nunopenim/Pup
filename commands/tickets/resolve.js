const resolveTicket = require('../../functions/tickets/resolveTicket.js');

module.exports = {
	name: 'resolve',
	description: 'Mark a ticket as resolved (Closes ticket at 12AM ET)',
	ephemeral: true,
	aliases: ['resolved'],
	async execute(message, args, client) {
		try {
			// Add user to ticket
			const msg = await resolveTicket(client, message.member, message.channel);

			// Send message
			await message.reply(msg);
		}
		catch (err) { client.error(err, message, true); }
	},
};