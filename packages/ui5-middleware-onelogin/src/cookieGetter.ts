import sleep from "sleep-promise";
import { Options } from "./types";
const prompt = require("async-prompt");
import { chromium } from "playwright-chromium";
const log = require("@ui5/logger").getLogger("server:custommiddleware:onelogin");

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
	async getCookie(options: Options): Promise<string> {
		let attr: Attributes = {
			url:
				options.configuration && options.configuration.path
					? options.configuration.path
					: process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL
					? process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL
					: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI!,
			username: options.configuration && options.configuration.username ? options.configuration.username : process.env.UI5_MIDDLEWARE_ONELOGIN_USERNAME!,
			password: options.configuration && options.configuration.password ? options.configuration.password : process.env.UI5_MIDDLEWARE_ONELOGIN_PASSWORD!,
		};

		if ((!attr.username || !attr.password) && !options.configuration.useCertificate) {
			log.warn("No credentials provided. Please answer the following prompts");
			if (!attr.username) {
				attr.username = await prompt("Username: ");
			}
			if (!attr.password) {
				attr.password = await prompt.password("Password: ");
			}
		}

		if ((attr.url.match(new RegExp("/", "g")) || []).length === 2 || attr.url.lastIndexOf("/") === attr.url.length - 1) {
			attr.url = `${attr.url.lastIndexOf("/") === attr.url.length - 1 ? attr.url : attr.url + "/"}sap/bc/ui2/flp`;
		}

		const playwrightOpt: PlaywrightOpt = {
			headless: options ? !options.configuration.debug : true,
			args: ["--disable-dev-shm-usage"],
			channel: "chrome",
		};

		try {
			const browser = await chromium.launch(playwrightOpt);
			const context = await browser.newContext({ ignoreHTTPSErrors: true });

			const page = await context.newPage();
			if (!options.configuration.useCertificate) {
				await page.goto(attr.url, { waitUntil: "domcontentloaded" });

				let elem;
				try {
					elem = await Promise.race([page.waitForSelector('input[type="email"]'), page.waitForSelector('input[type="username"]'), page.waitForSelector('input[name="sap-user"]')]);
				} catch (oError) {
					elem = await page.waitForSelector('input[type="text"]');
				}

				let password = page.locator('input[type="password"]');
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
			browser.close();
			return JSON.stringify(cookies);
		} catch (oError) {
			log.error(oError);
			throw oError;
		}
	}
}
