import React from "react";
import { Switch, Route, Link, useHistory } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { ThunkDispatch } from "redux-thunk";

import { useParams } from "react-router-dom";

import moment from "moment";

import { Redirect } from "react-router-dom";
import {
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IState,
  RequestStatus,
} from "./types";
import { URL_FOR_FIRST_PAGE_OF_EXAMPLES } from "./constants";

import {
  ActionAlerts,
  alertsCreate,
  IActionAlertsCreate,
} from "./features/alerts/alertsSlice";
import {
  ActionFetchProfile,
  ActionIssueJWSToken,
  fetchProfile,
  IActionClearAuthSlice,
  issueJWSToken,
} from "./features/auth/authSlice";
import {
  ActionDeleteEntry,
  ActionEditEntry,
  createEntry,
  deleteEntry,
  editEntry,
  fetchEntries,
} from "./features/entries/entriesSlice";
import {
  selectAuthRequestStatus,
  selectEntriesEntities,
  selectEntriesIds,
  selectEntriesLinks,
  selectEntriesMeta,
  selectHasValidToken,
  signOut,
} from "./store";
import { Alerts } from "./features/alerts/Alerts";
import { Home } from "./features/Home";
import { NavigationBar } from "./features/NavigationBar";
import { SignUp } from "./features/auth/SignUp";

const App = () => {
  console.log(`${new Date().toISOString()} - ${__filename} - React is rendering <App>`);

  const dispatch: ThunkDispatch<
    IState,
    unknown,
    IActionClearAuthSlice | ActionFetchProfile | IActionAlertsCreate
  > = useDispatch();

  React.useEffect(() => {
    console.log(
      `${new Date().toISOString()}` +
        ` - ${__filename}` +
        ` - React is running <App>'s useEffect hook`
    );

    const effectFn = async () => {
      console.log("    <App>'s useEffect hook is dispatching fetchProfile()");

      try {
        await dispatch(fetchProfile());
      } catch (err) {
        dispatch(signOut("TO CONTINUE, PLEASE SIGN IN"));
      }
    };

    effectFn();
  }, [dispatch]);

  return (
    <React.Fragment>
      {"<App>"}
      <NavigationBar />
      <Alerts />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/sign-up">
          <SignUp />
        </Route>
        <Route exact path="/sign-in">
          <SignIn />
        </Route>
        <PrivateRoute exact path="/journal-entries">
          <JournalEntries />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/create">
          <CreateEntry />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/:id/edit">
          <EditEntry />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/:id/delete">
          <DeleteEntry />
        </PrivateRoute>
      </Switch>
    </React.Fragment>
  );
};

export const SignIn = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignIn>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch: ThunkDispatch<
    IState,
    unknown,
    ActionIssueJWSToken | ActionAlerts | ActionFetchProfile
  > = useDispatch();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  if (hasValidToken === true) {
    const nextURL: string = "/";
    console.log(`    hasValidToken=${hasValidToken} > redirecting to ${nextURL} ...`);
    return <Redirect to={nextURL} />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (formData.email === "" || formData.password === "") {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else {
      try {
        await dispatch(issueJWSToken(formData.email, formData.password));
        dispatch(alertsCreate(id, "SIGN-IN SUCCESSFUL"));
        await dispatch(fetchProfile());
      } catch (thunkActionError) {
        dispatch(alertsCreate(id, thunkActionError));
      }
    }
  };

  return (
    <React.Fragment>
      {"<SignIn>"}
      <div>Log in to your account!</div>
      <form
        name="sign-in-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <input
            type="email"
            placeholder="Enter your email..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter your password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input type="submit" value="Sign me in" />
        </div>
      </form>
    </React.Fragment>
  );
};

export const PrivateRoute = (props: any) => {
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - React is rendering <PrivateRoute>`
  );

  console.log(`    its children are as follows:`);
  const childrenCount: number = React.Children.count(props.children);
  React.Children.forEach(props.children, (child, ind) => {
    console.log(
      `    child #${ind + 1} (out of ${childrenCount}): <${child.type.name}>`
    );
  });

  const { children, ...rest } = props;

  const authRequestStatus: RequestStatus = useSelector(selectAuthRequestStatus);
  console.log("    authRequestStatus:");
  console.log(`    ${authRequestStatus}`);

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  if (authRequestStatus === RequestStatus.LOADING) {
    console.log(`    rendering <div>"<childComponentName> - Loading..."</div>`);
    return React.Children.map(props.children, (child) => (
      <div>{`<${child.type.name}>`} - Loading...</div>
    ));
  } else if (!hasValidToken) {
    const nextURL: string = "/sign-in";
    console.log(`    hasValidToken=${hasValidToken} > redirecting to ${nextURL} ...`);
    return <Redirect to={nextURL} />;
  } else {
    console.log(
      `    hasValidToken=${hasValidToken} > rendering the above-listed children`
    );
    return <Route {...rest}>{children}</Route>;
  }
};

export const JournalEntries = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename}` +
      ` - React is rendering <JournalEntries>`
  );

  const entriesMeta: IPaginationMeta = useSelector(selectEntriesMeta);
  const entriesLinks: IPaginationLinks = useSelector(selectEntriesLinks);
  const entriesIds: number[] = useSelector(selectEntriesIds);
  console.log("    entriesIds:");
  console.log(`    ${JSON.stringify(entriesIds)}`);

  const entriesEntities: { [entryId: string]: IEntry } =
    useSelector(selectEntriesEntities);
  console.log("    entriesEntities:");
  console.log(`    ${JSON.stringify(entriesEntities)}`);

  const dispatch: ThunkDispatch<IState, unknown, IActionClearAuthSlice | ActionAlerts> =
    useDispatch();

  const [entriesUrl, setEntriesUrl] = React.useState<string>(
    URL_FOR_FIRST_PAGE_OF_EXAMPLES
  );

  React.useEffect(() => {
    console.log(
      `${new Date().toISOString()}` +
        ` - ${__filename}` +
        ` - React is running <JournalEntries>'s useEffect hook`
    );

    const effectFn = async () => {
      console.log(
        "    <JournalEntries>'s useEffect hook is dispatching fetchEntries()"
      );

      try {
        await dispatch(fetchEntries(entriesUrl));
      } catch (err) {
        if (err.response.status === 401) {
          dispatch(
            signOut("[FROM <JournalEntries>'S useEffect HOOK] PLEASE SIGN BACK IN")
          );
        } else {
          const id: string = uuidv4();
          const message: string =
            err.response.data.error ||
            "ERROR NOT FROM BACKEND BUT FROM FRONTEND COMPONENT";
          dispatch(alertsCreate(id, message));
        }
      }
    };

    effectFn();
  }, [dispatch, entriesUrl]);

  const entries = entriesIds.map((entryId: number) => {
    const e: IEntry = entriesEntities[entryId];

    return (
      <div key={e.id}>
        <hr />
        <SingleJournalEntry timestampInUTC={e.timestampInUTC} content={e.content} />
        <ul>
          <li>
            <Link to={`/entries/${e.id}/edit`}>Edit</Link>
          </li>
          <li>
            <DeleteEntryLink to={`/entries/${e.id}/delete`} />
          </li>
        </ul>
      </div>
    );
  });

  let paginationControllingButtons: JSX.Element;
  if (entriesMeta.page === null) {
    paginationControllingButtons = (
      <div>Building pagination-controlling buttons...</div>
    );
  } else {
    /*
    TODO: find out why
          this block requires the Non-null Assertion Operator (Postfix !) to be used twice,
          despite the fact this block appears to be in line with the recommendation on
          https://stackoverflow.com/a/46915314

          the "Non-null Assertion Operator (Postfix !)" is described on
          https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#strictnullchecks-on
    */
    const paginationCtrlBtnPrev: JSX.Element = (
      <button
        disabled={entriesLinks.prev === null}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          setEntriesUrl(entriesLinks.prev!)
        }
      >
        Previous page
      </button>
    );
    const paginationCtrlBtnNext: JSX.Element = (
      <button
        disabled={entriesLinks.next === null}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          setEntriesUrl(entriesLinks.next!)
        }
      >
        Next page
      </button>
    );

    const paginationCtrlBtnFirst: JSX.Element = (
      <button
        disabled={
          entriesLinks.first === null || entriesLinks.self === entriesLinks.first
        }
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          setEntriesUrl(entriesLinks.first!)
        }
      >
        First page: 1
      </button>
    );

    const paginationCtrlBtnLast: JSX.Element = (
      <button
        disabled={entriesLinks.last === null || entriesLinks.self === entriesLinks.last}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          setEntriesUrl(entriesLinks.last!)
        }
      >
        Last page: {entriesMeta.totalPages}
      </button>
    );

    paginationControllingButtons = (
      <React.Fragment>
        <div>
          {paginationCtrlBtnFirst} {paginationCtrlBtnPrev}{" "}
          <span style={{ color: "red" }}>Current page: {entriesMeta.page}</span>{" "}
          {paginationCtrlBtnNext} {paginationCtrlBtnLast}{" "}
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {"<JournalEntries>"}
      <p>
        <Link to="/entries/create">Create a new entry</Link>
      </p>
      <hr />
      <div>Review JournalEntries!</div>
      {paginationControllingButtons}
      {entries}
    </React.Fragment>
  );
};

type SingleJournalEntryProps = {
  timestampInUTC: string;
  content: string;
};

const SingleJournalEntry = (props: SingleJournalEntryProps) => {
  return (
    <React.Fragment>
      {"<SingleJournalEntry>"}
      <h3>
        {moment.utc(props.timestampInUTC).format("YYYY-MM-DD HH:mm")} (UTC +00:00)
      </h3>
      <p>{props.content}</p>
    </React.Fragment>
  );
};

export const DeleteEntryLink = (props: { to: string }) => {
  const targetURL: string = props.to;

  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - React is rendering <DeleteEntryLink to=${targetURL}>`
  );

  const [shouldDisplayHint, setShouldshouldDisplayHint] = React.useState(false);

  const hint = (
    <span> (HINT: After clicking, you will be asked to confirm your choice.)</span>
  );

  return (
    <React.Fragment>
      <Link
        to={targetURL}
        onMouseEnter={() => setShouldshouldDisplayHint(true)}
        onMouseLeave={() => setShouldshouldDisplayHint(false)}
      >
        Delete
      </Link>
      {shouldDisplayHint && hint}
    </React.Fragment>
  );
};

const offsetsFromUtc = () => {
  /*
  Create a list of the UTC time offsets
  "from the westernmost (−12:00) to the easternmost (+14:00)"
  (as per https://en.wikipedia.org/wiki/List_of_UTC_time_offsets ).
  */
  const start = -12;
  const end = 14;

  const nonnegativeOffsetsFromUtc = Array.from({ length: end + 1 }).map((_, ind) => {
    return "+" + ind.toString().padStart(2, "0") + ":00";
  });
  const negativeOffsetsFromUtc = Array.from({ length: -start }).map((_, ind) => {
    return "-" + (ind + 1).toString().padStart(2, "0") + ":00";
  });

  const offsetsFromUtc = negativeOffsetsFromUtc
    .reverse()
    .concat(nonnegativeOffsetsFromUtc);
  return offsetsFromUtc;
};

export const CreateEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <CreateEntry>`
  );

  const dispatch: ThunkDispatch<IState, unknown, IActionClearAuthSlice | ActionAlerts> =
    useDispatch();

  const [formData, setFormData] = React.useState({
    timezone: "",
    localTime: "",
    content: "",
  });

  const history = useHistory();

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (
      formData.timezone === "" ||
      formData.localTime === "" ||
      formData.content === ""
    ) {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else {
      try {
        await dispatch(
          createEntry(formData.localTime, formData.timezone, formData.content)
        );
        dispatch(alertsCreate(id, "ENTRY CREATION SUCCESSFUL"));
        history.push("/journal-entries");
      } catch (err) {
        if (err.response.status === 401) {
          dispatch(signOut("[FROM <CreateEntry>'S handleSubmit] PLEASE SIGN BACK IN"));
        } else {
          const id: string = uuidv4();
          const message: string =
            err.response.data.error ||
            "ERROR NOT FROM BACKEND BUT FROM FRONTEND COMPONENT";
          dispatch(alertsCreate(id, message));
        }
      }
    }
  };

  const timezoneOptions = offsetsFromUtc().map((offset, ind) => (
    <option key={ind} value={offset}>
      {offset}
    </option>
  ));

  return (
    <React.Fragment>
      {"<CreateEntry>"}
      <h3>You are about to create a new Entry:</h3>
      <hr />
      <form
        name="create-entry-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <label htmlFor="localTime-id">Specify your current local time:</label>
        </div>
        <div>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:MM"
            name="localTime"
            value={formData.localTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
            id="localTime-id"
          />
        </div>
        <div>
          <label htmlFor="timezone-id">
            Specify the time zone that you are currently in:
          </label>
        </div>
        <div>
          <select
            name="timezone"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
            id="timezone-id"
          >
            <option value="" />
            {timezoneOptions}
          </select>
          UTC
        </div>
        <div>
          <label htmlFor="content-id">Type up the content of your new Entry:</label>
        </div>
        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
            id="content-id"
          />
        </div>
        <hr />
        <div>
          <input type="submit" value="Create entry" />
        </div>
      </form>
    </React.Fragment>
  );
};

export const EditEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <EditEntry>`
  );

  const params: { id: string } = useParams();
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - inspecting the \`params\` passed in to <EditEntry>:`
  );
  console.log(params);
  const entryId: number = parseInt(params.id);
  console.log("    entryId:");
  console.log(`    ${entryId}`);

  const entry: IEntry = useSelector(selectEntriesEntities)[entryId];
  console.log("    entry:");
  console.log(`    ${JSON.stringify(entry)}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionEditEntry | ActionAlerts> =
    useDispatch();

  const [formData, setFormData] = React.useState({
    timezone: entry.utcZoneOfTimestamp,
    localTime: moment
      .utc(entry.timestampInUTC)
      .utcOffset(entry.utcZoneOfTimestamp)
      .format("YYYY-MM-DD HH:mm"),
    content: entry.content,
  });

  const history = useHistory();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (
      formData.timezone === "" ||
      formData.localTime === "" ||
      formData.content === ""
    ) {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else {
      try {
        await dispatch(
          editEntry(entryId, formData.localTime, formData.timezone, formData.content)
        );
        dispatch(alertsCreate(id, "ENTRY EDITING SUCCESSFUL"));
        history.push("/journal-entries");
      } catch (err) {
        if (err.response.status === 401) {
          dispatch(signOut("[FROM <EditEntry>'S handleSubmit] PLEASE SIGN BACK IN"));
        } else {
          const id: string = uuidv4();
          const message: string =
            err.response.data.error ||
            "ERROR NOT FROM BACKEND BUT FROM FRONTEND COMPONENT";
          dispatch(alertsCreate(id, message));
        }
      }
    }
  };

  const timezoneOptions = offsetsFromUtc().map((offset, ind) => (
    <option key={ind} value={offset}>
      {offset}
    </option>
  ));

  return (
    <React.Fragment>
      {"<EditEntry>"}
      <h3>You are about to edit the following Entry:</h3>
      <hr />
      <SingleJournalEntry
        timestampInUTC={entry.timestampInUTC}
        content={entry.content}
      />
      <hr />
      <form
        name="edit-entry-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <label htmlFor="localTime-id">
            Edit the local time of the Entry's creation:
          </label>
        </div>
        <div>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:MM"
            name="localTime"
            value={formData.localTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
            id="localTime-id"
          />
        </div>
        <div>
          <label htmlFor="timezone-id">
            Edit the time zone, which you were in at the moment when you created the
            Entry:
          </label>
        </div>
        <div>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
            id="timezone-id"
          >
            <option value="" />
            {timezoneOptions}
          </select>
          UTC
        </div>
        <div>
          <label htmlFor="content-id">Edit the content of the Entry:</label>
        </div>
        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
            id="content-id"
          />
        </div>
        <hr />
        <div>
          <input type="submit" value="Edit entry" />
        </div>
      </form>
    </React.Fragment>
  );
};

export const DeleteEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <DeleteEntry>`
  );
  const params: { id: string } = useParams();
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - inspecting the \`params\` passed in to <DeleteEntry>:`
  );
  console.log(params);
  const entryId: number = parseInt(params.id);
  console.log("    entryId:");
  console.log(`    ${entryId}`);

  const entry: IEntry = useSelector(selectEntriesEntities)[entryId];
  console.log("    entry:");
  console.log(`    ${JSON.stringify(entry)}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionDeleteEntry | ActionAlerts> =
    useDispatch();

  const history = useHistory();

  const handleClickYes = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const id: string = uuidv4();
    try {
      console.log(
        "    <DeleteEntry> - handleClickYes - await dispatch(deleteEntry(entryId))"
      );
      await dispatch(deleteEntry(entryId));

      console.log(
        `    <DeleteEntry> - handleClickYes - dispatch(alertsCreate(id, "ENTRY DELETION SUCCESSFUL"));`
      );
      dispatch(alertsCreate(id, "ENTRY DELETION SUCCESSFUL"));

      console.log(
        `    <DeleteEntry> - handleClickYes - history.push("/journal-entries");`
      );
      history.push("/journal-entries");
    } catch (err) {
      if (err.response.status === 401) {
        dispatch(signOut("[FROM <DeleteEntry>'S handleClickYes] PLEASE SIGN BACK IN"));
      } else {
        const message: string =
          err.response.data.error ||
          "ERROR NOT FROM BACKEND BUT FROM FRONTEND COMPONENT";
        dispatch(alertsCreate(id, message));
      }
    }
  };

  const handleClickNo = (e: React.MouseEvent<HTMLButtonElement>) => {
    return history.push("/journal-entries");
  };

  let content;
  if (entry !== undefined) {
    content = (
      <React.Fragment>
        <h3>You are about to delete the following Entry:</h3>
        <hr />
        <SingleJournalEntry
          timestampInUTC={entry.timestampInUTC}
          content={entry.content}
        />
        <hr />
        <div>Do you want to delete the selected Entry?</div>
        <ul>
          <li>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClickYes(e)}
            >
              Yes
            </button>
          </li>
          <li>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClickNo(e)}
            >
              No
            </button>
          </li>
        </ul>
      </React.Fragment>
    );
  } else {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      {"<DeleteEntry>"}
      {content}
    </React.Fragment>
  );
};

export default App;
