import React from 'react';
import Container from '@/business/ui/Container';
import './App.less';

@Container
export default class App extends React.Component {
  render() {
    const { children } = this.props;
    return children;
  }
}
