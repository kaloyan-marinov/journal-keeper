import { IStateAlerts } from "../../types";
import { INITIAL_STATE_ALERTS } from "../../constants";
import { MOCK_ALERT_17, MOCK_ALERT_34 } from "../../testHelpers";
import { alertsCreate, alertsReducer, alertsRemove } from "./alertsSlice";

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
      type: "alerts/create",
      payload: MOCK_ALERT_34,
    };

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
    const action = {
      type: "alerts/remove",
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
});
