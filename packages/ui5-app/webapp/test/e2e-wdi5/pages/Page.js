module.exports = class Page {
	async open(sHash) {
		await browser.goTo({ sHash: `${sHash}` });
	}
};
