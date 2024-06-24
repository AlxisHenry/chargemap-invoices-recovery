import puppeteer from "puppeteer";
import fs from "fs";

const urls = {
  login: "https://fr.chargemap.com/signin",
  invoices: "https://fr.chargemap.com/user/invoices",
  charges: "https://users.chargemap.com/community-charges/public-charges",
};

const selectors = {
  login: {
    acceptCookiesButton: "#didomi-notice-agree-button",
    loginButton:
      "#member_header > a.cmp-button.cmp-button--primary.cmp-button--primary__medium.gtm-NavBarPrincipale",
    email: "#signinEmail",
    password: "#signupPassword",
    submit:
      "#connexion > div > div.swiper-container > div > div:nth-child(1) > div:nth-child(2) > div > form > div:nth-child(5) > button",
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

async function sleep(ms = 1000) {
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

      const payment_date = line.querySelector("div h5").innerText.split(" ")[2];
      const amountWithCurrency = line.querySelector("div p").innerText;
      const amountWithoutCurrency = amountWithCurrency.replace("€", "");
      const amount = Math.round(
        parseFloat(amountWithoutCurrency) * 100
      ).toString();

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

  console.log("Environment variables are defined, puppeteer can be started.");

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
    args: ["--disable-features=site-per-process", "--window-size=1280,1080"],
  });

  const page = await browser.newPage();

  console.log("Opening the login page.");
  await page.goto(urls.login);

  try {
    await page.click(selectors.login.acceptCookiesButton);
  } catch (error) {
    console.log('The "Accept cookies" button was not found.');
  }

  await sleep();

  const { CHARGEMAP_EMAIL, CHARGEMAP_PASSWORD } = process.env;

  console.log("Typing the email and password.");
  await type(page, selectors.login.email, CHARGEMAP_EMAIL);
  await type(page, selectors.login.password, CHARGEMAP_PASSWORD);

  await sleep(1000);

  console.log("Submitting the login form.");
  await page.click(selectors.login.submit);

  await page.waitForNavigation();

  console.log("Opening the invoices page.");
  await page.goto(urls.invoices);

  await page.waitForSelector("#invoices > div.tw-text-center > ul");

  console.log("Getting the number of invoices pages.");
  const invoicesPages = await page.evaluate(() => {
    return document.querySelectorAll("#invoices > div.tw-text-center > ul > li")
      .length;
  });

  await sleep();

  console.log(`There are ${invoicesPages} invoices pages.`);

  let invoices = [];

  for (let i = 1; i <= invoicesPages; i++) {
    console.log(`Opening invoices page ${i}.`);
    const invoiceSelector = `#invoices > div.tw-text-center > ul > li:nth-child(${i}) > a`;
    await page.click(invoiceSelector);
    await sleep(500);
    invoices = invoices.concat(await getInvoices(page));
  }

  console.log("Writing the invoices to the file.");
  fs.writeFileSync(
    "app/public/invoices.json",
    JSON.stringify(invoices, null, 2)
  );

  await sleep(200);

  const { CHARGEMAP_ACCOUNT_ID } = process.env;
  const cookies = await page.cookies();

  try {
    const response = await fetch(
      `${urls.charges}?user_id=${CHARGEMAP_ACCOUNT_ID}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language":
            "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,es;q=0.5",
          authorization: cookies.find((cookie) => cookie.name === "session")
            .value,
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
      "app/public/charges.json",
      JSON.stringify(
        charges.items.map(({ date, charges }) => ({
          date,
          sessions: charges,
        })),
        null,
        2
      )
    );

    console.log("The charges have been written to the file.");
  } catch (error) {
    console.error(
      'The "Charges" API request failed, the session cookie might be invalid.'
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
