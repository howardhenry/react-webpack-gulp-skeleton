import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Home from './app/components/home';

// Init injectTapEventPlugin once
injectTapEventPlugin();

render((
    <Router history={browserHistory}>
        <Route path="/" component={Home} />
    </Router>
), window.document.getElementById('app'));
