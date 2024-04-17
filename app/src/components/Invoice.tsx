import { DateTime } from "luxon";
import type { ChargingSession, Invoice } from "../types";
import { parsePrice, unitCost } from "../services";

interface Props {
  invoice: Invoice;
  charges: ChargingSession[];
}

export function Invoice(props: Props) {
  const { invoice, charges } = props;

  return (
    <li
      className={
        "border-b border-gray-200 py-4 hover:bg-gray-50 hover:cursor-pointer px-1 transition-colors duration-200 ease-in-out"
      }
    >
      <div className={"flex justify-between items-center"}>
        <div className={"flex-1"}>
          <a href={invoice.invoice_url}>
            {DateTime.fromISO(invoice.date)
              .toLocaleString(DateTime.DATE_FULL)
              .slice(2)}
          </a>
        </div>
        <div className={"flex-1"}>
          <span className={"text-gray-500 text-sm block"}>
            Facturé le {invoice.payment_date}
          </span>
        </div>
        <div className={"flex-1"}>
          <span className={"float-right"}>{parsePrice(invoice.amount)}</span>
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

      <div className="mt-4">
        <ul className="grid grid-cols-3 gap-2">
          {charges.map((charge) => (
            <li
              key={charge.uid}
              className={
                "border border-gray-200 p-2 hover:bg-gray-50 hover:cursor-pointer transition-colors duration-200 ease-in-out"
              }
            >
              <div className="text-sm text-gray-500">{charge.pool.name}</div>
              <div className="text-sm font-bold">
                {parsePrice(charge.amount)}
              </div>
              <div className="text-sm font-bold">
                {unitCost(charge.amount, charge.energy)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
