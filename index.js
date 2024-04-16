import puppeteer from "puppeteer";
import fs from "fs";

const urls = {
  login: "https://fr.chargemap.com",
  invoices: "https://fr.chargemap.com/user/invoices",
  charges: "https://users.chargemap.com/community-charges/public-charges",
};

const selectors = {
  login: {
    acceptCookiesButton: "#didomi-notice-agree-button",
    loginButton:
      "#member_header > a.cmp-button.cmp-button--primary.cmp-button--primary__medium.gtm-NavBarPrincipale",
    email: "#signinEmail",
    password:
      "#connexion > div > div.swiper-container > div > div:nth-child(1) > div:nth-child(2) > div > form > div.input-group > input",
    submit:
      "#connexion > div > div.swiper-container > div > div:nth-child(1) > div:nth-child(2) > div > form > div:nth-child(7) > button",
  },
  invoices: {
    invoicesButton: "#member_header > a.cmp-button.cmp-button--primary",
  },
};

function ensureEnvironmentVariablesAreDefined() {
  const required = [
    "CHARGEMAP_EMAIL",
    "CHARGEMAP_PASSWORD",
    "CHARGEMAP_ACCOUNT_ID",
    "CHARGEMAP_AUTH_TOKEN",
  ];

  required.forEach((variable) => {
    if (!process.env[variable]) {
      console.error(
        `The environment variable ${variable} is required but not defined.`
      );
      process.exit(1);
    }
  });
}

async function type(page, selector, text) {
  const element = await page.waitForSelector(selector);
  await element.type(text);
  await element.dispose();
}

function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getInvoices(page) {
  return await page.evaluate(() => {
    let lines = document.querySelectorAll(".invoice-line");
    let invoices = [];

    Array.from(lines).forEach((_) => {
      const line = _.querySelector("a");
      let url = line.href,
        parts = url.split("/");

      const payment_date = line.querySelector("div h5").innerText.split(" ")[2],
        amount = line.querySelector("div p").innerText;

      let date = "";

      if (payment_date.includes("/")) {
        date = payment_date.split("/").slice(1).reverse().join("-");
      }

      invoices.push({
        date,
        payment_date,
        amount,
        invoice_id: parts[parts.length - 1],
        invoice_url: url,
      });
    });

    return invoices;
  });
}

async function main() {
  ensureEnvironmentVariablesAreDefined();

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
    args: ["--disable-features=site-per-process", "--window-size=1280,1080"],
  });

  const page = await browser.newPage();

  await page.goto(urls.login);

  try {
    await page.click(selectors.login.acceptCookiesButton);
  } catch (error) {
    console.error('The "Accept cookies" button was not found.');
  }

  await sleep();

  const { CHARGEMAP_EMAIL, CHARGEMAP_PASSWORD } = process.env;

  await page.click(selectors.login.loginButton);
  await sleep(1000);
  await type(page, selectors.login.email, CHARGEMAP_EMAIL);
  await type(page, selectors.login.password, CHARGEMAP_PASSWORD);
  await sleep(1000);
  await page.click(selectors.login.submit);

  await page.waitForNavigation();

  await page.goto(urls.invoices);

  await page.waitForSelector("#invoices > div.text-center > ul");

  const invoicesPages = await page.evaluate(() => {
    return document.querySelectorAll("#invoices > div.text-center > ul > li")
      .length;
  });

  await sleep();

  let invoices = [];

  for (let i = 1; i <= invoicesPages; i++) {
    const invoiceSelector = `#invoices > div.text-center > ul > li:nth-child(${i}) > a`;
    await page.click(invoiceSelector);
    await sleep(500);
    invoices = invoices.concat(await getInvoices(page));
  }

  fs.writeFileSync(
    "chargemap/invoices.json",
    JSON.stringify(invoices, null, 2)
  );

  await sleep(200);

  const { CHARGEMAP_ACCOUNT_ID, CHARGEMAP_AUTH_TOKEN } = process.env;

  try {
    const response = await fetch(
      `${urls.charges}?user_id=${CHARGEMAP_ACCOUNT_ID}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language":
            "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,es;q=0.5",
          authorization: CHARGEMAP_AUTH_TOKEN,
          baggage:
            "sentry-environment=production,sentry-release=20240314-101329,sentry-public_key=94f3f877053326442f895c22b0a69ae5,sentry-trace_id=6b78612b15ce4baf9f8cc018ff315282",
          "sec-ch-ua":
            '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sentry-trace": "6b78612b15ce4baf9f8cc018ff315282-8ad1b7f4dce43607",
          Referer: "https://users.chargemap.com/",
          "Referrer-Policy": "strict-origin",
        },
      }
    );

    const charges = await response.json();
    fs.writeFileSync(
      "chargemap/charges.json",
      JSON.stringify(charges, null, 2)
    );
  } catch (error) {
    console.error(
      'The "Charges" API request failed, be sure you entered a valid CHARGEMAP_AUTH_TOKEN.'
    );
  }

  await browser.close();
}

try {
  main();
} catch (error) {
  console.error(
    `The puppeteer script failed with the following error: ${error}`
  );
}
