import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Link to="/">Home</Link> | <Link to="/sign-up">Sign Up</Link> |{" "}
        <Link to="/sign-in">Sign In</Link> |{" "}
        <Link to="/my-monthly-journal">MyMonthlyJournal</Link>
      </div>
      <Switch>
        <Route exact path="/">
          <div>Welcome to MyMonthlyJournal!</div>
        </Route>
        <Route exact path="/sign-up">
          <div>Create a new account!</div>
        </Route>
        <Route exact path="/sign-in">
          <div>Log in to your account!</div>
        </Route>
        <Route exact path="/my-monthly-journal">
          <div>Review the entries in MyMonthlyJournal!</div>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
