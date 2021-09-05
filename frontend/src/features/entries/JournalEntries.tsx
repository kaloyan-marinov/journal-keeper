import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";

import { IEntry, IPaginationLinks, IPaginationMeta, IState } from "../../types";
import { URL_FOR_FIRST_PAGE_OF_EXAMPLES } from "../../constants";
import {
  selectEntriesEntities,
  selectEntriesIds,
  selectEntriesLinks,
  selectEntriesMeta,
  signOut,
} from "../../store";
import { ActionAlerts, alertsCreate } from "../alerts/alertsSlice";
import { IActionClearAuthSlice } from "../auth/authSlice";
import { DeleteEntryLink } from "./DeleteEntryLink";
import { fetchEntries } from "./entriesSlice";
import { SingleJournalEntry } from "./SingleJournalEntry";

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
