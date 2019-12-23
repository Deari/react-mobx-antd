import React from 'react';
import './App.less';
import Container from '../components/ui/Container';
@Container
export default class App extends React.Component {
  componentDidMount() {
    this.bindEvent = this.onBindEvent();
  }

  componentWillUnmount() {
    this.bindEvent && this.bindEvent();
  }

  onBindEvent = () => {
    const popStateEvent = () => {
      window.location.reload();
    };

    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', popStateEvent, false);
    }

    return () => {
      window.removeEventListener('popstate', popStateEvent, false);
    };
  };

  render() {
    const { children } = this.props;
    return children;
  }
}
