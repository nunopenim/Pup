const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { webhookport, topggauth } = require('../config/bot.json');
module.exports = client => {
	const port = webhookport;
	app.use(bodyParser.json());
	// on post to server check if authorization matches
	app.post('/', function(req, res) {
		const body = req.body;
		const headers = req.headers;
		if (headers.authorization === topggauth) {
			res.statusCode = 200;
			res.json({
				message: 'ok got it!',
			});
			require('../database/models/voteget')(client, body);
		}
		else {
			res.statusCode = 401;
			res.json({
				message: 'Error unauthorized!',
			});
		}
	});
	app.listen(port, () => {
		client.logger.info(`Webhook server loaded on port ${port}`);
	});

};