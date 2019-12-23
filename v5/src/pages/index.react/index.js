import './index.less';

import React from 'react';
import ReactDOM from 'react-dom';

import { configure } from 'mobx';
import { Provider } from 'mobx-react';

import { Router, browserHistory } from 'react-router';

import stores from '../../stores';
import routes from '../../routes';

configure({ enforceActions: true });

function hashLinkScroll() {
  const { hash } = window.location;
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      element && element.click(); // TODO
    }, 0);
  }
}

ReactDOM.render(
  <Provider {...stores}>
    <Router history={browserHistory} routes={routes} onUpdate={hashLinkScroll} />
  </Provider>,
  document.getElementById('{{name}}')
);
