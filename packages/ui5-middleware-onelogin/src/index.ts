import { serialize } from 'cookie';
import dotenv from 'dotenv';
import cookieGetter from './cookieGetter';
import {Options} from "./types";
const log = require('@ui5/logger').getLogger('server:custommiddleware:onelogin');
dotenv.config();

var cookie: string

//First time to make sure we only output the parsed cookie once
var firstTime: boolean = true

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
module.exports = function ({ options }: {options: Options}) {
  // eslint-disable-next-line func-names
  return async function (req: any, res: any, next: any) {
    let cookies = [];
    if (!process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL && !process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI && !options.configuration.path) {
      log.error('No login url provided');
      next();
      return;
    } else if (!cookie) {
      log.info('Fetching cookie, hang on!');
      try {
        const cookieObj = await new cookieGetter().getCookie(options);
        cookies = JSON.parse(cookieObj);
        cookie = cookieObj;
      } catch (error) {
        log.error('Could not get cookie');
        return
      }

    } else {
      cookies = JSON.parse(cookie);
    }

    let cookieStr: string = '';

    cookies
      .filter((cookieTemp: any) => !cookieTemp.name.includes('sap-contextid'))
      .forEach((cookie: any) => {
        cookie.key = cookie.name;
        delete cookie.expires;
        res.cookie(cookie.name, cookie.value, {
          maxAge: 86400 * 1000, // 24 hours
          httpOnly: true, // http only, prevents JavaScript cookie access
          secure: false, // cookie must be sent over https / ssl)
        });
        cookieStr = cookieStr.concat(
          serialize(cookie.name, cookie.value, { ...cookie, encode: (value) => value }),
          '; '
        );
      });
    if (options.configuration.debug && firstTime) {
      log.info(`Parsed cookie is ${cookieStr}`);
      firstTime = false;
    }
    req.headers.cookie = cookieStr;

    next();
  };
};
