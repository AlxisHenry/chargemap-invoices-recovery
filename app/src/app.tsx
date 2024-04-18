import "./index.css";
import { useEffect, useState } from "preact/hooks";

import {
  computeTotalChargeCost,
  computeTotalDuration,
  computeTotalEnergy,
  countSessionsFromInvoices,
  findInvoiceCharges,
  getDateWithMonthName,
  killowattHourCostAverage,
} from "./services";
import type { Invoice as InvoiceType, Charges } from "./types";
import { Invoice } from "./components/Invoice";
import { StatsCard } from "./components/StatsCard";
import { Session } from "./components/Session.tsx";

export function App() {
  const [invoicesLoaded, setInvoicesLoaded] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [chargesLoaded, setChargesLoaded] = useState<boolean>(false);
  const [charges, setCharges] = useState<Charges[]>([]);

  useEffect(() => {
    if (chargesLoaded && invoicesLoaded) {
      return;
    }

    fetch("/charges.json")
      .then((response) => response.json())
      .then((data: Charges[]) => {
        setCharges(data);
        setChargesLoaded(true);
      });

    fetch("/invoices.json")
      .then((response) => response.json())
      .then((data: InvoiceType[]) => {
        setInvoices(data);
        setInvoicesLoaded(true);
      });
  }, []);

  const isLoaded = invoicesLoaded && chargesLoaded;

  return (
    <div className="max-w-6xl mx-auto p-4 mb-12">
      <div className={"mt-6"}>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <div
          className={
            "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          }
        >
          {isLoaded && (
            <>
              <StatsCard title={"Nombre de mois"} value={invoices.length} />
              <StatsCard
                title={"Nombre de sessions"}
                value={countSessionsFromInvoices(invoices, charges)}
              />
              <StatsCard
                title={"Temps de recharge cumulé"}
                value={computeTotalDuration(charges)}
              />
              <StatsCard
                title={"Coût total des recharges"}
                value={computeTotalChargeCost(charges)}
                extension={"€"}
              />
              <StatsCard
                title={"Coût moyen du kWh"}
                value={killowattHourCostAverage(charges)}
                extension={"€/kWh"}
              />
              <StatsCard
                title={"Energie totale délivrée"}
                value={computeTotalEnergy(charges)}
                extension={"kWh"}
              />
            </>
          )}
        </div>
      </div>
      <div className={"mt-6"}>
        <h1 className="text-2xl font-bold">Sessions</h1>
        {charges.length > 0 &&
          charges.map((charge) => (
            <>
              <h2 className={"text-lg mt-4"}>
                {getDateWithMonthName(charge.date)}
              </h2>
              <table className="mt-3 w-full border border-gray-200">
                <tbody className="w-full border border-gray-200">
                  {charge.sessions.map((session) => (
                    <Session key={session.uid} session={session} />
                  ))}
                </tbody>
              </table>
            </>
          ))}
      </div>
      <div className={"mt-6"}>
        <h1 className="text-2xl font-bold">Factures</h1>
        <table className={"mt-6 border-t border-gray-200 px-1 w-full"}>
          <tbody>
            {isLoaded ? (
              invoices.map((invoice) => (
                <tr>
                  <Invoice
                    key={invoice.invoice_id}
                    invoice={invoice}
                    sessions={findInvoiceCharges(invoice, charges)}
                  />
                </tr>
              ))
            ) : (
              <li>Chargement...</li>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
