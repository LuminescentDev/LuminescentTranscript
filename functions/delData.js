module.exports = client => {
	client.delData = async function delData(table, id, args) {
		try {
			await client.query(`DELETE FROM ${table} WHERE ${id} = '${args}'`);
			client.logger.info(`${table} deleted for ${args}!`);
		}
		catch (error) {
			await client.users.cache.get('249638347306303499').send(`${error}`);
			client.logger.error(`Error deleting ${table}: ${error}`);
		}
		return;
	};
};