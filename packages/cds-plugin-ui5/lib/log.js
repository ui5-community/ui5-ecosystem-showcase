const colors = {
	log: "\x1b[0m", // default
	debug: "\x1b[34m", // blue
	info: "\x1b[32m", // green
	warn: "\x1b[33m", // yellow
	error: "\x1b[31m", // red
};

/**
 * helper to log colorful messages
 * @param {string} type the type of the message
 * @param {...string} message the message text
 */
function log(type, ...message) {
	if (!console[type]) {
		type = "log";
	}
	const args = [`\x1b[36m[cds-plugin-ui5]\x1b[0m %s[%s]\x1b[0m %s`, colors[type], type];
	message && args.push(...message);
	console[type].apply(console[type], args);
}

module.exports = log;
Object.keys(colors).forEach((level) => {
	module.exports[level] = log.bind(this, level);
});
