import { useDispatch, useSelector } from "react-redux";

import { IAlert } from "../../types";
import { selectAlertsEntities, selectAlertsIds } from "../../store";
import { alertsRemove } from "./alertsSlice";

export const Alerts = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <Alerts>`
  );

  const alertsIds: string[] = useSelector(selectAlertsIds);
  console.log("    alertsIds:");
  console.log(`    ${JSON.stringify(alertsIds)}`);

  const alertsEntities: { [alertId: string]: IAlert } =
    useSelector(selectAlertsEntities);
  console.log("    alertsEntities:");
  console.log(`    ${JSON.stringify(alertsEntities)}`);

  const dispatch = useDispatch();

  const handleClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(alertsRemove(id));
  };

  return (
    <>
      {"<Alerts>"}
      <br />
      {alertsIds.length === 0 ? (
        <br />
      ) : (
        alertsIds.map((id: string) => (
          <div key={id} style={{ color: "red" }}>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClick(id, e)}
            >
              Clear alert
            </button>
            {alertsEntities[id].message}
          </div>
        ))
      )}
    </>
  );
};
