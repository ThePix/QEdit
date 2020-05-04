import React from 'react'
import { Icon, Content } from 'rsuite'
import ResponsiveNav from '@rsuite/responsive-nav'
import ControlPane from './controlpane'
import * as Constants from './constants'

const styles = {
  height: Constants.TABHEIGHT,
  width:'calc(100vw - ' + Constants.SIDEBARWIDTH + 'px)'
}
export default class TabPane extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: ''
    }
    this.handleSelect = this.handleSelect.bind(this)
  }

  componentDidMount() {
    this.props.objects.on(Constants.UPDATE_OBJECT_EVENT,
      () => {this.forceUpdate()})
  }

  componentWillUnmount() {
    this.props.objects.off(Constants.UPDATE_OBJECT_EVENT,
      () => {this.forceUpdate()})
  }

  handleSelect(activeKey) {
    this.setState({ active: activeKey })
  }

  render() {
    const objects = this.props.objects
    const tabs = objects.controls.filter(c => objects.displayIf(c))
    const tabNames = tabs.map(el => el.tabName)
    const active = tabNames.includes(this.state.active) ?
      this.state.active : tabNames[0]
    return(
      <Content style={{height:'100%'}}>
        <ResponsiveNav
          appearance='subtle'
          activeKey={active}
          onSelect={this.handleSelect}
          style={styles}
          removable={false}
          moreText={<Icon icon="more" />}
          moreProps={{ noCaret: true }}
        >
        {tabs.map(item =>
          <ResponsiveNav.Item
            key={item.tabName}
            eventKey={item.tabName}
            icon={<Icon icon={item.icon} />}
          >
            {item.tabName}
          </ResponsiveNav.Item>)
        }
        </ResponsiveNav>
        <ControlPane
          objects={this.props.objects}
          controls={tabs.filter(t =>
            t.tabName === active)[0].tabControls.filter(c =>
              objects.displayIf(c))}
        />
      </Content>
    )
  }
}
