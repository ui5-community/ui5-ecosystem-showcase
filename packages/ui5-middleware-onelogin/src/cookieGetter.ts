/* eslint-disable @typescript-eslint/no-explicit-any */
import sleep from "sleep-promise";
import { Options } from "./types";
const prompt = require("async-prompt");
import { chromium, Locator, Page } from "playwright-chromium";

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

	/**
	 * @param page a page that is searched.
	 * @returns an input element from the page.
	 */
	async getUserInput(page: Page): Promise<Locator> {
		const preferred = page.locator('input[type="email"]').or(page.locator('input[type="username"]')).or(page.locator('input[name="sap-user"]')).nth(0);
		return (await preferred.count()) > 0 ? preferred : page.locator('input[type="text"]');
	}

	/**
	 * @param page a page.
	 * @returns whether the provided page is a login page.
	 */
	async isLoginPage(page: Page): Promise<boolean> {
		return (await (await this.getUserInput(page)).count()) > 0;
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
				clientCertificate: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_CLIENT_CERTIFICATE),
				debug: process.env.UI5_MIDDLEWARE_ONELOGIN_DEBUG === "true",
				query: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_QUERY),
				certificateOrigin: process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_ORIGIN,
				certificateCertPath: process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_CERT_PATH,
				certificateCert: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_CERT),
				certificateKeyPath: process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_KEY_PATH,
				certificateKey: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_KEY),
				certificatePfxPath: process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_PFX_PATH,
				certificatePfx: this.parseJSON(process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_PFX),
				certificatePassphrase: process.env.UI5_MIDDLEWARE_ONELOGIN_CERTIFICATE_PASSPHRASE,
			},
		});

		const effectiveOptions = Object.assign({}, options);
		effectiveOptions.configuration = Object.assign({}, defaultOptions.configuration, envOptions.configuration, options.configuration);

		const isUseCertificateEnabled = effectiveOptions.configuration.useCertificate;
		const hasCertificateConfig =
			effectiveOptions.configuration.certificateCertPath ||
			effectiveOptions.configuration.certificateCert ||
			effectiveOptions.configuration.certificateKeyPath ||
			effectiveOptions.configuration.certificateKey ||
			effectiveOptions.configuration.certificatePfxPath ||
			effectiveOptions.configuration.certificatePfx;
		const useClientCertificates = isUseCertificateEnabled && hasCertificateConfig;

		if (effectiveOptions.configuration.debug) {
			log.info("Default options:");
			log.info(defaultOptions);
			log.info("Env options:");
			log.info(envOptions);
			log.info("Yaml options:");
			log.info(options);
			log.info("Effective options:");
			log.info(effectiveOptions);
			log.info("Using client certificates: " + String(useClientCertificates));
		}

		const attr: Attributes = {
			url: effectiveOptions.configuration.path!,
			username: effectiveOptions.configuration.username!,
			password: effectiveOptions.configuration.password!,
		};

		if ((!attr.username || !attr.password) && !useClientCertificates) {
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
			const url = new URL(`${urlWithTrailingSlash}${effectiveOptions.configuration.subdirectory}`);
			const query = effectiveOptions.configuration.query;
			if (query) {
				// @ts-ignore
				Object.keys(query).forEach((key) => url.searchParams.append(key, query[key]));
			}
			attr.url = url.href;
			if (effectiveOptions.configuration.debug) log.info(`Trying to fetch cookie from "${attr.url}"`);
		}

		const playwrightOpt: PlaywrightOpt = {
			headless: options ? !effectiveOptions.configuration.debug : true,
			args: ["--disable-dev-shm-usage"],
			channel: "chrome",
		};

		try {
			const browser = await chromium.launch(playwrightOpt);
			const contextOptions: any = { ignoreHTTPSErrors: true };

			if (useClientCertificates) {
				contextOptions.clientCertificates = [
					{
						origin: effectiveOptions.configuration.certificateOrigin,
						certPath: effectiveOptions.configuration.certificateCertPath,
						cert: effectiveOptions.configuration.certificateCert,
						keyPath: effectiveOptions.configuration.certificateKeyPath,
						key: effectiveOptions.configuration.certificateKey,
						pfxPath: effectiveOptions.configuration.certificatePfxPath,
						pfx: effectiveOptions.configuration.certificatePfx,
						passphrase: effectiveOptions.configuration.certificatePassphrase,
					},
				];
			}

			if (effectiveOptions.configuration.debug) {
				log.info("Client certificates configuration:");
				log.info(contextOptions.clientCertificates);
			}

			const context = await browser.newContext(contextOptions);

			const page = await context.newPage();
			if (!useClientCertificates) {
				await page.goto(attr.url, { waitUntil: "domcontentloaded" });

				const elem = await this.getUserInput(page);

				const password = page.locator('input[type="password"]');
				let isHidden = await password.getAttribute("aria-hidden");
				await elem.fill(attr.username);
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
				// Certificate login without certificate configuration
			} else if (isUseCertificateEnabled && hasCertificateConfig) {
				// Full certificate login with provided configuration
				log.info("Login with certificate configuration. Waiting for page to load...");
				await page.goto(attr.url, { waitUntil: "networkidle" });
				// Add more robust certificate handling here if needed
			} else if (isUseCertificateEnabled && !hasCertificateConfig) {
				// Certificate login without explicit configuration
				// (might be using system certificates)
				await page.goto(attr.url, { waitUntil: "networkidle" });

				let isLoginPage = true;
				for (let attempt = 0; attempt < 3; attempt++) {
					if (attempt > 0) {
						await page.reload({ waitUntil: "networkidle" });
						await page.waitForTimeout(attempt * 1000);
					}
					isLoginPage = await this.isLoginPage(page);
					if (!isLoginPage) {
						break;
					} else if (effectiveOptions.configuration.debug) {
						log.info(`"${attr.url}" looks like a login page, reloading...`);
					}
				}
				if (isLoginPage && effectiveOptions.configuration.debug) {
					log.info(`Couldn't login using a certificate!`);
				}
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
