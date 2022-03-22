import test, { expect } from '@playwright/test';
import CookieGetter from '../cookieGetter';
import dotenv from 'dotenv';
import {Options} from "../types";

dotenv.config();

const getCookie = async (url: string) => {
  const options : Options = {
    configuration: {
      debug: true
    }
  }
  const cookieStr = await new CookieGetter().getCookie(options);
  return cookieStr;
};

test('Login to SapDevCenter', async () => {
  
  const cookieStr: any = await getCookie(process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL);
  expect(JSON.parse(cookieStr).filter(function(oCookie: any){ return oCookie.name === 'MYSAPSSO2'})[0]).toBeDefined()
});

test('Login to AzureAD', async () => {
  process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL = process.env.UI5_MIDDLEWARE_ONELOGIN_AZURE_LOGIN_URL;
  process.env.UI5_MIDDLEWARE_ONELOGIN_USERNAME = process.env.UI5_MIDDLEWARE_ONELOGIN_AZURE_USERNAME;
  process.env.UI5_MIDDLEWARE_ONELOGIN_PASSWORD = process.env.UI5_MIDDLEWARE_ONELOGIN_AZURE_PASSWORD;
  const cookieStr: any = await getCookie(process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL);
  expect(cookieStr).toBeDefined();
});

test('Login to Google', async () => {
  process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL = process.env.UI5_MIDDLEWARE_ONELOGIN_GOOGLE_LOGIN_URL;
  process.env.UI5_MIDDLEWARE_ONELOGIN_USERNAME = process.env.UI5_MIDDLEWARE_ONELOGIN_GOOGLE_USERNAME;
  process.env.UI5_MIDDLEWARE_ONELOGIN_PASSWORD = process.env.UI5_MIDDLEWARE_ONELOGIN_GOOGLE_PASSWORD;
  const cookieStr: any = await getCookie(process.env.UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL);
  expect(cookieStr).toBeDefined();
});
