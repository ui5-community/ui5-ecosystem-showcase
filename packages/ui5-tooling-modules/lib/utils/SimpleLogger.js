const SimpleLogger = {
	create: (prefix) => {
		prefix = prefix ? `[${prefix}]` : "";
		return {
			log: console.log.bind(console, prefix),
			warn: console.warn.bind(console, prefix),
			error: console.error.bind(console, prefix),
		};
	},
};

module.exports = SimpleLogger;
