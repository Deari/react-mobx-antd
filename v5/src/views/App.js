import { Container } from '@/business/Common/Container'
import React from 'react'
import './App.less'

@Container
export default class App extends React.Component {
  render() {
    const { children } = this.props
    return children
  }
}
