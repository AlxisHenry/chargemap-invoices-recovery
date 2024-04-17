import { DateTime } from "luxon";

import type { Session as SessionType, Invoice } from "../types";
import { parsePrice } from "../services";

import { Session } from "./Session";

interface Props {
  invoice: Invoice;
  sessions: SessionType[];
}

export function Invoice(props: Props) {
  const { invoice, sessions } = props;

  return (
    <div className={"border-b border-gray-200 py-4"}>
      <div className={"flex justify-between items-center"}>
        <div className={"flex-1"}>
          <a href={invoice.invoice_url} class={"text-lg"}>
            {DateTime.fromISO(invoice.date)
              .toLocaleString(DateTime.DATE_FULL)
              .slice(2)}
          </a>
        </div>
        <div className={"flex-1"}>
          <div
            className={
              "bg-green-100 text-green-500 p-2 rounded-xl text-md text-center font-bold w-fit"
            }
          >
            Payé le {invoice.payment_date}
          </div>
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
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Session key={session.uid} session={session} />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-md text-gray-500">
                Cette facture ne contient pas de session de charge.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
