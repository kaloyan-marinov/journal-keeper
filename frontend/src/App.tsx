import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Link to="/">Home</Link> | <Link to="/sign-up">Sign Up</Link>
      </div>
      <Switch>
        <Route exact path="/">
          <div>Welcome to MyMonthlyJournal!</div>
        </Route>
        <Route exact path="/sign-up">
          <div>Create a new account!</div>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
