function formatPrice(price: string): number {
  return parseInt(price) / 100;
}

export function formatChargeDuration(minutes: number): string {
  return `${Math.ceil(minutes)} min.`;
}

export function fromWattHourToKilowattHour(energy: number): number {
  return energy / 1000;
}

export function parsePrice(price: string, currency: string = "€"): string {
  return `${formatPrice(price).toFixed(2)} ${currency}`;
}

export function unitCost(price: string, energy: number): string {
  // round 3 decimals
  return `${
    Math.round(
      (formatPrice(price) / fromWattHourToKilowattHour(energy)) * 1000
    ) / 1000
  } €/kWh`;
}
