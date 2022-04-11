"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sleep_promise_1 = __importDefault(require("sleep-promise"));
const prompt = require("async-prompt");
const playwright_chromium_1 = require("playwright-chromium");
const log = require('@ui5/logger').getLogger('server:custommiddleware:onelogin');
class CookieGetter {
    getCookie(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let attr = {
                url: (options.configuration && options.configuration.path) ? options.configuration.path : (process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL) ? process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL : process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
                username: (options.configuration && options.configuration.username) ? options.configuration.username : process.env.UI5_MIDDLEWARE_ONELOGIN_USERNAME,
                password: (options.configuration && options.configuration.password) ? options.configuration.password : process.env.UI5_MIDDLEWARE_ONELOGIN_PASSWORD,
            };
            if ((!attr.username || !attr.password) && !options.configuration.useCertificate) {
                log.warn("No credentials provided. Please answer the following prompts");
                if (!attr.username) {
                    attr.username = yield prompt('Username: ');
                }
                if (!attr.password) {
                    attr.password = yield prompt.password('Password: ');
                }
            }
            if ((attr.url.match(new RegExp("/", "g")) || []).length === 2 || attr.url.lastIndexOf("/") === attr.url.length - 1) {
                attr.url = `${(attr.url.lastIndexOf("/") === attr.url.length - 1) ? attr.url : attr.url + "/"}sap/bc/ui2/flp`;
            }
            const playwrightOpt = {
                headless: (options) ? !options.configuration.debug : true,
                args: ['--disable-dev-shm-usage'],
                channel: 'chrome'
            };
            try {
                const browser = yield playwright_chromium_1.chromium.launch(playwrightOpt);
                const context = yield browser.newContext({ ignoreHTTPSErrors: true });
                const page = yield context.newPage();
                if (!options.configuration.useCertificate) {
                    yield page.goto(attr.url, { waitUntil: 'domcontentloaded' });
                    let elem;
                    try {
                        elem = yield Promise.race([
                            page.waitForSelector('input[type="email"]'),
                            page.waitForSelector('input[type="username"]'),
                            page.waitForSelector('input[name="sap-user"]')
                        ]);
                    }
                    catch (oError) {
                        elem = yield page.waitForSelector('input[type="text"]');
                    }
                    let password = page.locator('input[type="password"]');
                    let isHidden = yield password.getAttribute('aria-hidden');
                    yield elem.type(attr.username);
                    if (!!isHidden && isHidden !== null) {
                        try {
                            yield page.click('input[type="submit"]', { timeout: 500 });
                        }
                        catch (oError) {
                            //This can happen if we are using google
                            const buttonLocator = yield Promise.race([
                                page.waitForSelector('text="Next"'),
                                page.waitForSelector('text="Submit"'),
                                page.waitForSelector('text="Yes"'),
                                page.waitForSelector('text="Login"'),
                                page.waitForSelector('text="Yes"')
                            ]);
                            //@ts-ignore
                            yield buttonLocator.click({ waitUntil: 'networkidle' });
                            yield (0, sleep_promise_1.default)(1000);
                        }
                    }
                    while (!!isHidden) {
                        yield (0, sleep_promise_1.default)(2000);
                        isHidden = yield password.getAttribute('aria-hidden');
                    }
                    yield password.type(attr.password);
                    try {
                        yield page.waitForSelector('*[type="submit"]', { timeout: 500 });
                        //@ts-ignore
                        yield page.click('*[type="submit"]', { waitUntil: 'networkidle' });
                    }
                    catch (oError) {
                        const buttonLocator = yield Promise.race([
                            page.waitForSelector('text="Next"'),
                            page.waitForSelector('text="Submit"'),
                            page.waitForSelector('text="Yes"'),
                            page.waitForSelector('//*[@id="LOGON_BUTTON"]')
                        ]);
                        //@ts-ignore
                        yield buttonLocator.click({ waitUntil: 'networkidle' });
                    }
                    try {
                        yield page.waitForSelector('text="No"', { timeout: 2000 });
                        if (yield page.isVisible('text=Stay signed in?')) {
                            //@ts-ignore
                            yield page.click('text="No"', endUrl ? {} : { waitUntil: 'networkidle' });
                        }
                    }
                    catch (oError) {
                        //This error is fine, it's not locating the No button specifically for Azure
                    }
                }
                else {
                    yield page.goto(attr.url, { waitUntil: 'networkidle' });
                }
                const cookies = yield context.cookies();
                browser.close();
                return JSON.stringify(cookies);
            }
            catch (oError) {
                log.error(oError);
                throw oError;
            }
        });
    }
}
exports.default = CookieGetter;
//# sourceMappingURL=cookieGetter.js.map