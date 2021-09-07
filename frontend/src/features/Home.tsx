import React from "react";
import { useSelector } from "react-redux";

import { IProfile } from "../types";
import { selectSignedInUserProfile } from "../store";

export const Home = () => {
  console.log(
    `${new Date().toISOString()}` + ` - ${__filename}` + ` - React is rendering <Home>`
  );

  const signedInUserProfile: IProfile | null = useSelector(selectSignedInUserProfile);
  console.log("    signedInUserProfile:");
  console.log(`    ${JSON.stringify(signedInUserProfile)}`);

  const greeting =
    signedInUserProfile !== null
      ? `Hello, ${signedInUserProfile.name}!`
      : "Welcome to JournalKeeper!";

  return (
    <React.Fragment>
      {"<Home>"}
      <div>{greeting}</div>
    </React.Fragment>
  );
};
