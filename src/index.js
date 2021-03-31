/*!

=========================================================
* Material Dashboard React - v1.9.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { Router, Route, Switch, Redirect } from 'react-router-dom'

// core components
import Admin from 'layouts/Admin.js'
import RTL from 'layouts/RTL.js'
import Choice from 'layouts/Choice'
import Regression from 'layouts/Regression'
import TimeSeries from 'layouts/TimeSeries'

import 'assets/css/material-dashboard-react.css?v=1.9.0'
import Auth from 'layouts/Auth'
import Clustering from 'layouts/Clustering'

const hist = createBrowserHistory()

ReactDOM.render(
  <Router history={hist}>
    <Switch>
      <Route path='/admin' component={Admin} />
      <Route path='/choice' component={Choice} />
      <Route path='/regression' component={Regression} />
      <Route path='/timeseries' component={TimeSeries} />
      <Route path='/clustering' component={Clustering} />
      <Route path='/auth' component={Auth} />
      <Route path='/rtl' component={RTL} />
      <Redirect from='/' to='/auth/signin' />
    </Switch>
  </Router>,
  document.getElementById('root')
)
