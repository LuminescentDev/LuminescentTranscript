module.exports = client => {

	client.setSettings = function setSettings(args) {
		try {
			client.con.query(`INSERT INTO settings (guildId) VALUES (?) ON DUPLICATE KEY UPDATE guildId = ${args}`, [args]);
		}
		catch (error) {
			client.users.cache.get(client.config.ownerID[0]).send(`${error}`);
			client.channels.cache.get(client.config.errorChannelID).send(`Error creating guild settings: ${error}`);
		}
	};
};