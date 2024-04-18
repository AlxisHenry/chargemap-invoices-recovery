import type { Invoice, Charges, Session } from "../types";

const months: Record<string, string> = {
  "01": "janvier",
  "02": "février",
  "03": "mars",
  "04": "avril",
  "05": "mai",
  "06": "juin",
  "07": "juillet",
  "08": "août",
  "09": "septembre",
  "10": "octobre",
  "11": "novembre",
  "12": "décembre",
};

export function getDateWithMonthName(date: string): string {
  const [year, month] = date.split("-");
  return `${months[month]} ${year}`;
}

function formatPrice(price: string): number {
  return parseInt(price) / 100;
}

export function findInvoiceCharges(
  invoice: Invoice,
  charges: Charges[]
): Session[] {
  return charges
    .filter((charge) => charge.date === invoice.date)
    .flatMap((charge) => charge.sessions);
}

export function computeTotalDuration(charges: Charges[]): string {
  return formatChargeDuration(
    charges
      .flatMap((charge) => charge.sessions)
      .reduce((acc, charge) => acc + charge?.duration, 0)
  );
}

export function computeTotalEnergy(charges: Charges[]): string {
  return `${fromWattHourToKilowattHour(
    charges
      .flatMap((charge) => charge.sessions)
      .reduce((acc, charge) => acc + charge.energy, 0)
  ).toFixed(2)}`;
}

export function killowattHourCostAverage(charges: Charges[]): string {
  let totalEnergy = charges
    .flatMap((charge) => charge.sessions)
    .reduce((acc, charge) => acc + charge.energy, 0);

  let totalCost = charges
    .flatMap((charge) => charge.sessions)
    .reduce((acc, charge) => acc + formatPrice(charge.amount), 0);

  return `${
    Math.round((totalCost / fromWattHourToKilowattHour(totalEnergy)) * 1000) /
    1000
  }`;
}

export function formatStartDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR");
}

export function computeTotalChargeCost(charges: Charges[]): string {
  let total = charges
    .flatMap((charge) => charge.sessions)
    .reduce((acc, charge) => acc + formatPrice(charge.amount), 0);

  return `${total.toString()}`;
}

export function countSessionsFromInvoices(
  invoices: Invoice[],
  charges: Charges[]
): number {
  return invoices.flatMap((invoice) => findInvoiceCharges(invoice, charges))
    .length;
}

export function formatChargeDuration(minutes: number): string {
  let duration = Math.ceil(minutes);

  if (duration < 60) {
    return `${duration} min.`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.ceil(minutes % 60);
  return `${hours} h. ${remainingMinutes} min.`;
}

export function fromWattHourToKilowattHour(energy: number): number {
  return energy / 1000;
}

export function parsePrice(price: string, currency: string = "€"): string {
  return `${formatPrice(price).toFixed(2)} ${currency}`;
}

export function unitCost(price: string, energy: number): string {
  return `${
    Math.round(
      (formatPrice(price) / fromWattHourToKilowattHour(energy)) * 1000
    ) / 1000
  } €/kWh`;
}
