import { DateTime } from "luxon";
import type { ChargingSession, Invoice } from "../types";
import {
  formatChargeDuration,
  fromWattHourToKilowattHour,
  parsePrice,
  unitCost,
} from "../services";

interface Props {
  invoice: Invoice;
  charges: ChargingSession[];
}

export function Invoice(props: Props) {
  const { invoice, charges } = props;

  return (
    <div
      className={
        "border-b border-gray-200 py-4 hover:bg-gray-50 px-1 transition-colors duration-200 ease-in-out"
      }
    >
      <div className={"flex justify-between items-center"}>
        <div className={"flex-1"}>
          <a href={invoice.invoice_url} class={"text-lg"}>
            {DateTime.fromISO(invoice.date)
              .toLocaleString(DateTime.DATE_FULL)
              .slice(2)}
          </a>
        </div>
        <div className={"flex-1"}>
          <span className={"text-gray-500 text-md block"}>
            Payement effectué le {invoice.payment_date}
          </span>
        </div>
        <div className={"flex-1"}>
          <span className={"float-right text-md font-bold"}>
            {parsePrice(invoice.amount)}
          </span>
        </div>
        <div className={"flex-1"}>
          <a
            href={invoice.invoice_url}
            className={
              "float-right bg-gray-100 p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-600 hover:cursor-pointer"
            }
            target="_blank"
          >
            <svg
              className={"w-6 h-6 text-gray-500"}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      <table className="mt-8 w-full">
        <tbody className="w-full">
          {charges.length > 0 ? (
            charges.map((charge) => (
              <tr key={charge.uid} className={"py-2"}>
                <td className="text-md text-gray-500">{charge.pool.name}</td>
                <td className="text-md">
                  {formatChargeDuration(charge.duration)}
                </td>
                <td className="text-md">
                  {fromWattHourToKilowattHour(charge.energy)} kWh
                </td>
                <td className="text-md">
                  {unitCost(charge.amount, charge.energy)}
                </td>
                <td className="text-md">
                  {parsePrice(charge.amount)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-md text-gray-500">
                Aucune charge n'a été effectuée pour cette facture.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
