import { JSX } from "preact/jsx-runtime";

import type { Session as ChargingSessionType } from "../types";
import {
  formatChargeDuration,
  formatStartDate,
  fromWattHourToKilowattHour,
  parsePrice,
  unitCost,
} from "../services";

interface Props {
  session: ChargingSessionType;
}

export function Session(props: Props): JSX.Element {
  const { session } = props;

  return (
    <tr key={session.uid} className={"py-2"}>
      <td className="text-md text-gray-500">{session.pool.name}</td>
      <td className="hidden lg:table-cell text-md text-right" style={{ width: "12%" }}>
        {formatStartDate(session.start_date)}
      </td>
      <td className="text-md text-right" style={{ width: "12%" }}>
        {formatChargeDuration(session.duration)}
      </td>
      <td className="hidden lg:table-cell text-md text-right" style={{ width: "12%" }}>
        {fromWattHourToKilowattHour(session.energy)} kWh
      </td>
      <td className="hidden lg:table-cell text-md text-right" style={{ width: "12%" }}>
        {unitCost(session.amount, session.energy)}
      </td>
      <td className="text-md text-right" style={{ width: "12%" }}>
        {parsePrice(session.amount)}
      </td>
    </tr>
  );
}
