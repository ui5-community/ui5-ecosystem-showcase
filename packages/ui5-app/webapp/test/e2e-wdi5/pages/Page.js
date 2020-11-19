module.exports = class Page {
    open(sHash) {
        browser.goTo({sHash: `index.html${sHash}`})
    }
}
