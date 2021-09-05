import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { selectHasValidToken, signOut } from "../store";

export const NavigationBar = () => {
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - React is rendering <NavigationBar>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(signOut("SIGN-OUT SUCCESSFUL"));
  };

  const navigationLinks = !hasValidToken ? (
    <React.Fragment>
      <Link to="/">Home</Link> | <Link to="/sign-in">Sign In</Link> |{" "}
      <Link to="/sign-up">Sign Up</Link>
    </React.Fragment>
  ) : (
    <React.Fragment>
      <Link to="/">Home</Link> | <Link to="/journal-entries">JournalEntries</Link> |{" "}
      <a href="#!" onClick={() => handleClick()}>
        Sign Out
      </a>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <div>{"<NavigationBar>"}</div>
      <div>{navigationLinks}</div>
    </React.Fragment>
  );
};
