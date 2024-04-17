import "./index.css";
import { useEffect, useState } from "preact/hooks";

import { parsePrice } from "./services";
import type {
  Invoice as InvoiceType,
  MonthlyCharges,
  MonthlyChargesJson,
} from "./types";
import { Invoice } from "./components/Invoice";

export function App() {
  const [invoicesLoaded, setInvoicesLoaded] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [monthlyChargesLoaded, setMonthlyChargesLoaded] =
    useState<boolean>(false);
  const [monthlyCharges, setMonthlyCharges] = useState<MonthlyCharges[]>([]);

  useEffect(() => {
    fetch("/charges.json")
      .then((response) => response.json())
      .then((data: MonthlyChargesJson) => {
        setMonthlyCharges(data.items);
        setMonthlyChargesLoaded(true);
      });

    fetch("/invoices.json")
      .then((response) => response.json())
      .then((data: InvoiceType[]) => {
        setInvoices(data);
        setInvoicesLoaded(true);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Factures</h1>
      <ul className={"mt-6 border-t border-gray-200 px-1"}>
        {invoicesLoaded ? (
          invoices.map((invoice) => (
            <Invoice
              key={invoice.invoice_id}
              invoice={invoice}
              charges={
                monthlyCharges.find((_) => _.date === invoice.date)?.charges ||
                []
              }
            />
          ))
        ) : (
          <li>Chargement...</li>
        )}
      </ul>
    </div>
  );
}
