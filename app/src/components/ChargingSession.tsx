import { JSX } from "preact/jsx-runtime";

import { type ChargingSession as ChargingSessionType } from "../types";
import { parsePrice } from "../services";

interface Props {
  session: ChargingSessionType;
}

export function ChargingSession(props: Props): JSX.Element {
  const { session } = props;

  return (
    <div>
      <h1>Charging Session</h1>
      <span>{ parsePrice(session.amount) }</span>
    </div>
  );
}
