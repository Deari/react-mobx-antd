import React from 'react';
import './App.less';
import Container from '../components/ui/Container';
import ajax from '@liepin/ajax';
console.log('ajax', ajax);
@Container
export default class App extends React.Component {
  render() {
    const { children } = this.props;
    return children;
  }
}
