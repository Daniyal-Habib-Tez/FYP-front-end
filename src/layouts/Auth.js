import React, { useEffect } from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";

import { authRoutes } from "routes.js";

import styles from "assets/jss/material-dashboard-react/layouts/authStyle.js";

const switchRoutes = (
  <Switch>
    {authRoutes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      return null;
    })}
    <Redirect from="/auth" to="/auth/signin" />
  </Switch>
);

const useStyles = makeStyles(styles);

export default function Auth({ ...rest }) {

  const history = useHistory();

  useEffect(() => {
    var user = localStorage.getItem("user");
    if (user) {
      history.push("/admin")
    }
  }, [])
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();
  return (
    <div className={classes.wrapper}>
      <div className={classes.mainPanel} ref={mainPanel}>
        <div className={classes.map}>{switchRoutes}</div>
      </div>
    </div>
  );
}
