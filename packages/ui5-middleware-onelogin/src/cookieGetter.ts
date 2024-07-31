/* eslint-disable @typescript-eslint/no-explicit-any */
import sleep from "sleep-promise";
import { Options } from "./types";
const prompt = require("async-prompt");
import { chromium } from "playwright-chromium";

interface Attributes {
	url: string;
	username: string;
	password: string;
}

interface PlaywrightOpt {
	headless: boolean;
	args: string[];
	channel?: "chrome";
}
export default class CookieGetter {
	/**
	 * Removes undefined properties from the object. The object is mutated. This is a deep check.
	 * @param obj The object.
	 * @returns The mutated object.
	 */
	private sanitizeObject(obj?: any): any {
		Object.keys(obj).forEach((key) => {
			if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
				this.sanitizeObject(obj[key]);
			} else {
				obj[key] === undefined && delete obj[key];
			}
		});
		return obj;
	}

	/**
	 * @param value a (in-)valid json string or undefined.
	 * @returns the parsed JSON object or undefined.
	 */
	private parseJSON(value?: string): any {
		if (value === undefined) return undefined;
		try {
			return JSON.parse(value);
		} catch (e) {
			return undefined;
		}
	}

	async getCookie(log: any, options: Options): Promise<string> {
		options = this.sanitizeObject(options);

		const defaultOptions: Options = this.sanitizeObject({
			configuration: {
				path: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
				subdirectory: "sap/bc/ui2/flp/",
				useCertificate: false,
				query: this.parseJSON(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_QUERY),
			},
		});

		const envOptions: Options = this.sanitizeObject({
			configuration: {
				path: process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL,
				subdirectory: process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_SUBDIRECTORY,
				username: process.env.UI5_MIDDLEWARE_ONELOGIN_USERNAME,
				password: process.env.UI5_MIDDLEWARE_ONELOGIN_PASSWORD,
				useCertificate: process.env.UI5_MIDDLEWARE_ONELOGIN_USE_CERTIFICATE === "true",
				debug: process.env.UI5_MIDDLEWARE_ONELOGIN_DEBUG === "true",
				query: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_QUERY),
			},
		});

		const effectiveOptions = Object.assign({}, options);
		effectiveOptions.configuration = Object.assign({}, defaultOptions.configuration, envOptions.configuration, options.configuration);

		if (effectiveOptions.configuration.debug) {
			log.info("Default options:");
			log.info(defaultOptions);
			log.info("Env options:");
			log.info(envOptions);
			log.info("Yaml options:");
			log.info(options);
			log.info("Effective options:");
			log.info(effectiveOptions);
		}

		const attr: Attributes = {
			url: effectiveOptions.configuration.path!,
			username: effectiveOptions.configuration.username!,
			password: effectiveOptions.configuration.password!,
		};

		if ((!attr.username || !attr.password) && !effectiveOptions.configuration.useCertificate) {
			log.warn("No credentials provided. Please answer the following prompts");
			if (!attr.username) {
				attr.username = await prompt("Username: ");
			}
			if (!attr.password) {
				attr.password = await prompt.password("Password: ");
			}
		}

		if ((attr.url.match(new RegExp("/", "g")) || []).length === 2 || attr.url.lastIndexOf("/") === attr.url.length - 1) {
			const urlWithTrailingSlash = attr.url.lastIndexOf("/") === attr.url.length - 1 ? attr.url : attr.url + "/";
			const search = new URLSearchParams();
			const query = effectiveOptions.configuration.query;
			if (query) {
				Object.keys(query).forEach((key) => search.append(key, query[key]));
			}
			const searchParams = search.size > 0 ? `?${search.toString()}` : "";
			attr.url = `${urlWithTrailingSlash}${effectiveOptions.configuration.subdirectory}${searchParams}`;
			if (effectiveOptions.configuration.debug) log.info(`Trying to fetch cookie from "${attr.url}"`);
		}

		const playwrightOpt: PlaywrightOpt = {
			headless: options ? !effectiveOptions.configuration.debug : true,
			args: ["--disable-dev-shm-usage"],
			channel: "chrome",
		};

		try {
			const browser = await chromium.launch(playwrightOpt);
			const context = await browser.newContext({ ignoreHTTPSErrors: true });

			const page = await context.newPage();
			if (!effectiveOptions.configuration.useCertificate) {
				await page.goto(attr.url, { waitUntil: "domcontentloaded" });

				let elem;
				try {
					elem = await Promise.race([page.waitForSelector('input[type="email"]'), page.waitForSelector('input[type="username"]'), page.waitForSelector('input[name="sap-user"]')]);
				} catch (oError) {
					elem = await page.waitForSelector('input[type="text"]');
				}

				const password = page.locator('input[type="password"]');
				let isHidden = await password.getAttribute("aria-hidden");
				await elem.type(attr.username);
				if (!!isHidden && isHidden !== null) {
					try {
						await page.click('input[type="submit"]', { timeout: 500 });
					} catch (oError) {
						//This can happen if we are using google
						const buttonLocator = await Promise.race([
							page.waitForSelector('text="Next"'),
							page.waitForSelector('text="Submit"'),
							page.waitForSelector('text="Yes"'),
							page.waitForSelector('text="Login"'),
							page.waitForSelector('text="Yes"'),
						]);
						//@ts-ignore

						await buttonLocator.click({ waitUntil: "networkidle" });
						await sleep(1000);
					}
				}
				while (!!isHidden) {
					await sleep(2000);

					isHidden = await password.getAttribute("aria-hidden");
				}
				await password.type(attr.password);
				try {
					await page.waitForSelector('*[type="submit"]', { timeout: 500 });
					//@ts-ignore
					await page.click('*[type="submit"]', { waitUntil: "networkidle" });
				} catch (oError) {
					const buttonLocator = await Promise.race([
						page.waitForSelector('text="Next"'),
						page.waitForSelector('text="Submit"'),
						page.waitForSelector('text="Yes"'),
						page.waitForSelector('//*[@id="LOGON_BUTTON"]'),
					]);
					//@ts-ignore

					await buttonLocator.click({ waitUntil: "networkidle" });
				}

				try {
					await page.waitForSelector('text="No"', { timeout: 2000 });
					if (await page.isVisible("text=Stay signed in?")) {
						//@ts-ignore
						await page.click('text="No"', endUrl ? {} : { waitUntil: "networkidle" });
					}
				} catch (oError) {
					//This error is fine, it's not locating the No button specifically for Azure
				}
			} else {
				await page.goto(attr.url, { waitUntil: "networkidle" });
			}

			const cookies = await context.cookies();
			if (cookies.length === 0) {
				throw new Error(`No cookies could be found for "${attr.url}". This usually indicates that the url points to a location that does not require a login!`);
			}
			browser.close();
			return JSON.stringify(cookies);
		} catch (oError) {
			log.error(oError);
			throw oError;
		}
	}
}
