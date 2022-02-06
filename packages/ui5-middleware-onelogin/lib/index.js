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
const cookie_1 = require("cookie");
const dotenv_1 = __importDefault(require("dotenv"));
const cookieGetter_1 = __importDefault(require("./cookieGetter"));
const log = require('@ui5/logger').getLogger('server:custommiddleware:onelogin');
dotenv_1.default.config();
// interface cookieFace {
// name: string,
// key: string
// }
/**
 * Custom UI5 Server middleware example
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.
 *                                        all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.
 *                                        rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies
 *                                        Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration
 *                                                      if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({ options }) {
    // eslint-disable-next-line func-names
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let cookies = [];
            if (!process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL) {
                next();
            }
            else if (!process.env.cookie) {
                log.info('Fetching cookie, hang on!');
                const cookieObj = yield new cookieGetter_1.default().getCookie(options);
                cookies = JSON.parse(cookieObj);
                process.env.cookie = cookieObj;
            }
            else {
                cookies = JSON.parse(process.env.cookie);
            }
            let cookieStr = '';
            cookies
                .filter((cookieTemp) => !cookieTemp.name.includes('sap-contextid'))
                .forEach((cookie) => {
                cookie.key = cookie.name;
                delete cookie.expires;
                res.cookie(cookie.name, cookie.value, {
                    maxAge: 86400 * 1000,
                    httpOnly: true,
                    secure: false, // cookie must be sent over https / ssl)
                });
                cookieStr = cookieStr.concat((0, cookie_1.serialize)(cookie.name, cookie.value, Object.assign(Object.assign({}, cookie), { encode: (value) => value })), '; ');
            });
            if (options.configuration.debug) {
                log.info(`Parsed cookie is ${cookieStr}`);
            }
            req.headers.cookie = cookieStr;
            next();
        });
    };
};
//# sourceMappingURL=index.js.map