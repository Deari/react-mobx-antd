export default {
  path: '/view/',
  component: require('../views/App').default,
  childRoutes: [require('./home').default, require('./404').default, require('./redirect').default]
};
