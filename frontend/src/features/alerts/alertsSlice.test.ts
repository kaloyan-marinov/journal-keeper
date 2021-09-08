import { IStateAlerts } from "../../types";
import { INITIAL_STATE_ALERTS } from "../../constants";
import { MOCK_ALERT_17, MOCK_ALERT_34 } from "../../testHelpers";
import {
  ActionTypesAlerts,
  alertsCreate,
  alertsReducer,
  alertsRemove,
  IActionAlertsRemove,
} from "./alertsSlice";

describe("action creators", () => {
  test("alertsCreate", () => {
    const action = alertsCreate(MOCK_ALERT_17.id, MOCK_ALERT_17.message);

    expect(action).toEqual({
      type: "alerts/create",
      payload: MOCK_ALERT_17,
    });
  });

  test("alertsRemove", () => {
    const action = alertsRemove(MOCK_ALERT_17.id);

    expect(action).toEqual({
      type: "alerts/remove",
      payload: {
        id: MOCK_ALERT_17.id,
      },
    });
  });
});

describe("reducer", () => {
  let initStAlerts: IStateAlerts;

  beforeEach(() => {
    initStAlerts = { ...INITIAL_STATE_ALERTS };
  });

  test("alerts/create", () => {
    initStAlerts = {
      ids: [MOCK_ALERT_17.id],
      entities: {
        [MOCK_ALERT_17.id]: MOCK_ALERT_17,
      },
    };
    const action = {
      type: ActionTypesAlerts.CREATE,
      payload: MOCK_ALERT_34,
    };

    /*
    TODO: why doesn't the lack of a type annotation for `action` cause
          VS Code to issue a type warning in the next statement)
          (as it would in the analogous situation for the next test)?
    */
    const newSt: IStateAlerts = alertsReducer(initStAlerts, action);

    expect(newSt).toEqual({
      ids: [MOCK_ALERT_34.id, MOCK_ALERT_17.id],
      entities: {
        [MOCK_ALERT_34.id]: MOCK_ALERT_34,
        [MOCK_ALERT_17.id]: MOCK_ALERT_17,
      },
    });
  });

  test("alerts/remove", () => {
    initStAlerts = {
      ids: [MOCK_ALERT_17.id, MOCK_ALERT_34.id],
      entities: {
        [MOCK_ALERT_17.id]: MOCK_ALERT_17,
        [MOCK_ALERT_34.id]: MOCK_ALERT_34,
      },
    };
    const action: IActionAlertsRemove = {
      type: ActionTypesAlerts.REMOVE,
      payload: {
        id: MOCK_ALERT_34.id,
      },
    };

    const newSt: IStateAlerts = alertsReducer(initStAlerts, action);

    expect(newSt).toEqual({
      ids: [MOCK_ALERT_17.id],
      entities: {
        [MOCK_ALERT_17.id]: MOCK_ALERT_17,
      },
    });
  });

  test(
    "an action, which this reducer doesn't specifically handle," +
      " should not modify its associated state (slice)",
    () => {
      initStAlerts = {
        ids: [MOCK_ALERT_17.id, MOCK_ALERT_34.id],
        entities: {
          [MOCK_ALERT_17.id]: MOCK_ALERT_17,
          [MOCK_ALERT_34.id]: MOCK_ALERT_34,
        },
      };
      const action: any = {
        type: "an action, which this reducer doesn't specifically handle",
      };

      const newSt: IStateAlerts = alertsReducer(initStAlerts, action);

      expect(newSt).toEqual(initStAlerts);
    }
  );
});
