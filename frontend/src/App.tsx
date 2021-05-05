import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { createStore } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { v4 as uuidv4 } from "uuid";
import { Dispatch } from "redux";

/* Specify an initial value for the Redux state. */
enum RequestStatus {
  IDLE = "idle",
  LOADING = "loading",
  FAILED = "failed",
  SUCCEEDED = "succeeded",
}

interface IAlert {
  id: string;
  message: string;
}

interface IStateAlerts {
  ids: string[];
  entities: {
    [alertId: string]: IAlert;
  };
}

interface IState {
  alerts: IStateAlerts;
  auth: {
    requestStatus: RequestStatus;
    requestError: string | null;
  };
}

export const initialState: IState = {
  alerts: {
    ids: [],
    entities: {},
  },
  auth: {
    requestStatus: RequestStatus.IDLE,
    requestError: null,
  },
};

/* Action creators */
enum CreateUserActionTypes {
  PENDING = "auth/createUser/pending",
  REJECTED = "auth/createUser/rejected",
  FULFILLED = "auth/createUser/fulfilled",
}

interface ICreateUserPendingAction {
  type: typeof CreateUserActionTypes.PENDING;
}

interface ICreateUserRejectedAction {
  type: typeof CreateUserActionTypes.REJECTED;
  error: string;
}

interface ICreateUserFulfilledAction {
  type: typeof CreateUserActionTypes.FULFILLED;
}

export const createUserPending = (): ICreateUserPendingAction => ({
  type: CreateUserActionTypes.PENDING,
});

export const createUserRejected = (error: string): ICreateUserRejectedAction => ({
  type: CreateUserActionTypes.REJECTED,
  error,
});

export const createUserFulfilled = (): ICreateUserFulfilledAction => ({
  type: CreateUserActionTypes.FULFILLED,
});

type CreateUserAction =
  | ICreateUserPendingAction
  | ICreateUserRejectedAction
  | ICreateUserFulfilledAction;

enum AlertActionTypes {
  CREATE = "alerts/create",
  REMOVE = "alerts/remove",
}

interface IAlertCreateAction {
  type: typeof AlertActionTypes.CREATE;
  payload: {
    id: string;
    message: string;
  };
}

interface IAlertRemoveAction {
  type: typeof AlertActionTypes.REMOVE;
  payload: {
    id: string;
  };
}

export const alertCreate = (id: string, message: string): IAlertCreateAction => ({
  type: AlertActionTypes.CREATE,
  payload: {
    id,
    message,
  },
});

export const alertRemove = (id: string): IAlertRemoveAction => ({
  type: AlertActionTypes.REMOVE,
  payload: {
    id,
  },
});

type AlertAction = IAlertCreateAction | IAlertRemoveAction;

/*
Define a root reducer function,
which serves to instantiate a single Redux store.

(In turn, that store will be tasked with keeping track of the React application's
global state.)
*/
export const rootReducer = (
  state: IState = initialState,
  action: CreateUserAction | AlertAction
) => {
  switch (action.type) {
    case CreateUserActionTypes.PENDING:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.LOADING,
        },
      };
    case CreateUserActionTypes.REJECTED:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.FAILED,
          requestError: action.error,
        },
      };
    case CreateUserActionTypes.FULFILLED:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.SUCCEEDED,
          requestError: null,
        },
      };
    case AlertActionTypes.CREATE:
      const id: string = action.payload.id;
      const message: string = action.payload.message;

      const newIds: string[] = [id, ...state.alerts.ids];

      const newEntities = { ...state.alerts.entities };
      newEntities[id] = {
        id,
        message,
      };

      return {
        ...state,
        alerts: {
          ids: newIds,
          entities: newEntities,
        },
      };
    case AlertActionTypes.REMOVE:
      const idOfDeletedAlert: string = action.payload.id;

      const remainingIds: string[] = state.alerts.ids.filter(
        (id) => id !== idOfDeletedAlert
      );

      const remainingEntities = { ...state.alerts.entities };
      delete remainingEntities[idOfDeletedAlert];

      return {
        ...state,
        alerts: {
          ids: remainingIds,
          entities: remainingEntities,
        },
      };
    default:
      return state;
  }
};

const composedEnhancer = composeWithDevTools();
export const store = createStore(rootReducer, composedEnhancer);

/* Create React components. */
const App = () => {
  console.log(`${new Date().toISOString()} - ${__filename} - React is rendering <App>`);

  return (
    <React.Fragment>
      {"<App>"}
      <BrowserRouter>
        <div>
          <Link to="/">Home</Link> | <Link to="/sign-up">Sign Up</Link> |{" "}
          <Link to="/sign-in">Sign In</Link> |{" "}
          <Link to="/my-monthly-journal">MyMonthlyJournal</Link>
        </div>
        <Alerts />
        <Switch>
          <Route exact path="/">
            <div>Welcome to MyMonthlyJournal!</div>
          </Route>
          <Route exact path="/sign-up">
            <SignUp />
          </Route>
          <Route exact path="/sign-in">
            <SignIn />
          </Route>
          <Route exact path="/my-monthly-journal">
            <MyMonthlyJournal />
          </Route>
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
};

export const Alerts = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <Alerts>`
  );

  const dispatch = useDispatch();

  const alerts: IStateAlerts = useSelector((state: IState) => state.alerts);

  const onClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(alertRemove(id));
  };

  return (
    <>
      {"<Alerts>"}
      <br />
      {alerts.ids.length === 0 ? (
        <br />
      ) : (
        alerts.ids.map((id: string) => (
          <div key={id} style={{ color: "red" }}>
            {"\u00A0\u00A0\u00A0\u00A0<Alert>"}
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(id, e)}
            >
              X
            </button>
            {alerts.entities[id].message}
          </div>
        ))
      )}
    </>
  );
};

export const SignUp = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignUp>`
  );

  const dispatch: Dispatch<
    IAlertCreateAction | ICreateUserPendingAction
  > = useDispatch();

  const [formData, setFormData] = React.useState({
    username: "",
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.repeatPassword) {
      const id: string = uuidv4();
      const message: string = "THE PROVIDED PASSWORDS DON'T MATCH!";
      dispatch(alertCreate(id, message));
      console.log("invalid situation - `repeatPassword` doesn't match `password`");
    } else {
      dispatch(createUserPending());
      // Note to self:
      // doing anything beyond simple `console.log` calls in this `else` clause
      // should be postponed until
      // after the logic within the `if` clause has been _properly_ implemented.
    }
  };

  return (
    <React.Fragment>
      {"<SignUp>"}
      <div>Create a new account!</div>
      <form
        name="sign-up-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
      >
        <div>
          <input
            type="text"
            placeholder="Choose a username..."
            name="username"
            value={formData.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter your name..."
            name="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Enter your email address..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Choose a password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Repeat the chosen password..."
            name="repeatPassword"
            value={formData.repeatPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <input type="submit" value="Create an account for me" />
      </form>
    </React.Fragment>
  );
};

export const SignIn = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignIn>`
  );

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <React.Fragment>
      {"<SignIn>"}
      <div>Log in to your account!</div>
      <form name="sign-in-form">
        <div>
          <input
            type="email"
            placeholder="Enter your email..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter your password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input type="submit" value="Sign me in" />
        </div>
      </form>
    </React.Fragment>
  );
};

interface IEntry {
  id: number;
  timestampInUTC: string;
  utcZoneOfTimestamp: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export const MyMonthlyJournal = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename}` +
      ` - React is rendering <MyMonthlyJournal>`
  );

  const entriesEntities: { [key: string]: IEntry } = {
    1: {
      id: 1,
      timestampInUTC: "2020-12-01T15:17:00.000Z",
      utcZoneOfTimestamp: "+02:00",
      content: "Then it dawned on me: there is no finish line!",
      createdAt: "2021-04-29T05:10:56.000Z",
      updatedAt: "2021-04-29T05:10:56.000Z",
      userId: 1,
    },
    2: {
      id: 2,
      timestampInUTC: "2019-08-20T13:17:00.000Z",
      utcZoneOfTimestamp: "+01:00",
      content: "Mallorca has beautiful sunny beaches!",
      createdAt: "2021-04-29T05:11:01.000Z",
      updatedAt: "2021-04-29T05:11:01.000Z",
      userId: 2,
    },
  };

  const entriesIds: number[] = [2, 1];

  const entries = entriesIds.map((entryId: number) => {
    const e: IEntry = entriesEntities[entryId];

    return (
      <div key={e.id}>
        <hr></hr>
        <h3>{e.timestampInUTC} UTC</h3>
        <p>{e.content}</p>
        <Link to="#">Edit</Link>
      </div>
    );
  });

  return (
    <React.Fragment>
      {"<MyMonthlyJournal>"}
      <div>Review the entries in MyMonthlyJournal!</div>
      <Link to="#">Create a new entry</Link>
      {entries}
    </React.Fragment>
  );
};

export default App;
