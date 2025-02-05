/**
 * Dumps the memory usage of the current process
 */
module.exports = function dumpMemory() {
	const usedInitial = process.memoryUsage();
	for (let key in usedInitial) {
		console.log(`${key} ${Math.round((usedInitial[key] / 1024 / 1024) * 100) / 100} MB`);
	}
};
