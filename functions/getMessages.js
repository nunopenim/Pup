module.exports = async function getMessages(channel, limit = 100) {
	const messagechunks = [];
	let remaining = limit;
	let last_id;
	if (limit <= 100) {
		const messages = await channel.messages.fetch({ limit }).catch(err => { throw err; });
		messagechunks.push(messages);
	}
	else {
		while (remaining == 'infinite' || remaining > 0) {
			const options = { limit: 100 };
			if (remaining < 100) {
				options.limit = remaining;
				remaining = 0;
			}
			else if (remaining != 'infinite') {
				remaining = remaining - 100;
			}
			if (last_id) options.before = last_id;

			const messages = await channel.messages.fetch(options).catch(err => { throw err; });
			messagechunks.push(messages);
			last_id = messages.last().id;
			if (messages.size < 100) remaining = 0;
		}
	}

	return messagechunks;
};