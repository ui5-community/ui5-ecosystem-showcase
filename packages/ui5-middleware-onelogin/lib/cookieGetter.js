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
/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep_promise_1 = __importDefault(require("sleep-promise"));
const prompt = require("async-prompt");
const playwright_chromium_1 = require("playwright-chromium");
class CookieGetter {
    /**
     * Removes undefined properties from the object. The object is mutated. This is a deep check.
     * @param obj The object.
     * @returns The mutated object.
     */
    sanitizeObject(obj) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
                this.sanitizeObject(obj[key]);
            }
            else {
                obj[key] === undefined && delete obj[key];
            }
        });
        return obj;
    }
    /**
     * @param value a (in-)valid json string or undefined.
     * @returns the parsed JSON object or undefined.
     */
    parseJSON(value) {
        if (value === undefined)
            return undefined;
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return undefined;
        }
    }
    /**
     * @param page a page that is searched.
     * @returns an input element from the page.
     */
    getUserInput(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferred = page.locator('input[type="email"]').or(page.locator('input[type="username"]')).or(page.locator('input[name="sap-user"]')).nth(0);
            return (yield preferred.count()) > 0 ? preferred : page.locator('input[type="text"]');
        });
    }
    /**
     * @param page a page.
     * @returns whether the provided page is a login page.
     */
    isLoginPage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this.getUserInput(page)).count()) > 0;
        });
    }
    getCookie(log, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = this.sanitizeObject(options);
            const defaultOptions = this.sanitizeObject({
                configuration: {
                    path: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
                    subdirectory: "sap/bc/ui2/flp/",
                    useCertificate: false,
                    query: this.parseJSON(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_QUERY),
                },
            });
            const envOptions = this.sanitizeObject({
                configuration: {
                    path: process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL,
                    subdirectory: process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_SUBDIRECTORY,
                    username: process.env.UI5_MIDDLEWARE_ONELOGIN_USERNAME,
                    password: process.env.UI5_MIDDLEWARE_ONELOGIN_PASSWORD,
                    useCertificate: process.env.UI5_MIDDLEWARE_ONELOGIN_USE_CERTIFICATE === "true",
                    clientCertificates: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_CLIENT_CERTIFICATES),
                    debug: process.env.UI5_MIDDLEWARE_ONELOGIN_DEBUG === "true",
                    query: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_QUERY),
                },
            });
            const effectiveOptions = Object.assign({}, options);
            effectiveOptions.configuration = Object.assign({}, defaultOptions.configuration, envOptions.configuration, options.configuration);
            // Check if clientCertificates should be used: useCertificate is true and clientCertificates is defined or clientCertificates contains any certificate
            const useClientCertificates = effectiveOptions.configuration.useCertificate ||
                (effectiveOptions.configuration.clientCertificates &&
                    effectiveOptions.configuration.clientCertificates.some(cert => cert.certPath || cert.cert || cert.keyPath || cert.key || cert.pfxPath || cert.pfx));
            if (effectiveOptions.configuration.debug) {
                log.info("Default options:");
                log.info(defaultOptions);
                log.info("Env options:");
                log.info(envOptions);
                log.info("Yaml options:");
                log.info(options);
                log.info("Effective options:");
                log.info(effectiveOptions);
                log.info(`Using client certificates: ${useClientCertificates}`);
            }
            const attr = {
                url: effectiveOptions.configuration.path,
                username: effectiveOptions.configuration.username,
                password: effectiveOptions.configuration.password,
            };
            if ((!attr.username || !attr.password) && !useClientCertificates) {
                log.warn("No credentials provided. Please answer the following prompts");
                if (!attr.username) {
                    attr.username = yield prompt("Username: ");
                }
                if (!attr.password) {
                    attr.password = yield prompt.password("Password: ");
                }
            }
            if ((attr.url.match(new RegExp("/", "g")) || []).length === 2 || attr.url.lastIndexOf("/") === attr.url.length - 1) {
                const urlWithTrailingSlash = attr.url.lastIndexOf("/") === attr.url.length - 1 ? attr.url : attr.url + "/";
                const url = new URL(`${urlWithTrailingSlash}${effectiveOptions.configuration.subdirectory}`);
                const query = effectiveOptions.configuration.query;
                if (query) {
                    // @ts-ignore
                    Object.keys(query).forEach((key) => url.searchParams.append(key, query[key]));
                }
                attr.url = url.href;
                if (effectiveOptions.configuration.debug)
                    log.info(`Trying to fetch cookie from "${attr.url}"`);
            }
            const playwrightOpt = {
                headless: options ? !effectiveOptions.configuration.debug : true,
                args: ["--disable-dev-shm-usage"],
                channel: "chrome",
            };
            try {
                const browser = yield playwright_chromium_1.chromium.launch(playwrightOpt);
                const contextOptions = { ignoreHTTPSErrors: true };
                if (useClientCertificates && effectiveOptions.configuration.clientCertificates) {
                    contextOptions.clientCertificates = effectiveOptions.configuration.clientCertificates;
                }
                if (effectiveOptions.configuration.debug) {
                    log.info("Client certificates configuration:");
                    log.info(contextOptions.clientCertificates);
                }
                const context = yield browser.newContext(contextOptions);
                const page = yield context.newPage();
                if (!useClientCertificates) {
                    yield page.goto(attr.url, { waitUntil: "domcontentloaded" });
                    const elem = yield this.getUserInput(page);
                    const password = page.locator('input[type="password"]');
                    let isHidden = yield password.getAttribute("aria-hidden");
                    yield elem.fill(attr.username);
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
                                page.waitForSelector('text="Yes"'),
                            ]);
                            //@ts-ignore
                            yield buttonLocator.click({ waitUntil: "networkidle" });
                            yield (0, sleep_promise_1.default)(1000);
                        }
                    }
                    while (!!isHidden) {
                        yield (0, sleep_promise_1.default)(2000);
                        isHidden = yield password.getAttribute("aria-hidden");
                    }
                    yield password.type(attr.password);
                    try {
                        yield page.waitForSelector('*[type="submit"]', { timeout: 500 });
                        //@ts-ignore
                        yield page.click('*[type="submit"]', { waitUntil: "networkidle" });
                    }
                    catch (oError) {
                        const buttonLocator = yield Promise.race([
                            page.waitForSelector('text="Next"'),
                            page.waitForSelector('text="Submit"'),
                            page.waitForSelector('text="Yes"'),
                            page.waitForSelector('//*[@id="LOGON_BUTTON"]'),
                        ]);
                        //@ts-ignore
                        yield buttonLocator.click({ waitUntil: "networkidle" });
                    }
                    try {
                        yield page.waitForSelector('text="No"', { timeout: 2000 });
                        if (yield page.isVisible("text=Stay signed in?")) {
                            //@ts-ignore
                            yield page.click('text="No"', endUrl ? {} : { waitUntil: "networkidle" });
                        }
                    }
                    catch (oError) {
                        //This error is fine, it's not locating the No button specifically for Azure
                    }
                }
                else {
                    yield page.goto(attr.url, { waitUntil: "networkidle" });
                    let isLoginPage = true;
                    for (let attempt = 0; attempt < 3; attempt++) {
                        if (attempt > 0) {
                            yield page.reload({ waitUntil: "networkidle" });
                            yield page.waitForTimeout(attempt * 1000);
                        }
                        isLoginPage = yield this.isLoginPage(page);
                        if (!isLoginPage) {
                            break;
                        }
                        else {
                            if (effectiveOptions.configuration.debug) {
                                log.info(`"${attr.url}" looks like a login page, reloading...`);
                            }
                        }
                    }
                    if (isLoginPage) {
                        if (effectiveOptions.configuration.debug) {
                            log.info(`Couldn't login using a certificate!`);
                        }
                    }
                }
                const cookies = yield context.cookies();
                if (cookies.length === 0) {
                    throw new Error(`No cookies could be found for "${attr.url}". This usually indicates that the url points to a location that does not require a login!`);
                }
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