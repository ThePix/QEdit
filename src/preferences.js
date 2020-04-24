import React, {Component} from 'react'
import Store from 'electron-store'
import * as Constants from './constants'

const defaultPreferences = {
  jsShowRoomsOnly: false,
  jsNewRoomWhere: Constants.WHERE_TOP,
  jsNewItemWhere: Constants.WHERE_LOCATION,
  jsAutosaveInterval: 1,
  darkMode: false
}
const preferences = new Store({defaults:defaultPreferences})

export default class Preferences extends Component {
  constructor() {
    super()
    this.state = {showPreferences: false}
  }
  showPreferences() {
    this.setState({showPreferences: true})
  }

  hidePreferences() {
    this.setState({showPreferences: false})
  }

  onChange(newValue) {
      this.set(newValue.target.id, newValue.target.value)
      // TODO: Check if this is needed.
      this.forceUpdate()
  }

  get(key) {
    return preferences.get(key)
  }

  set(key, value) {
    preferences.set(key, value)
  }

  render() {
    const showHideClassName = this.state.showPreferences ? "modal display-block" : "modal display-none";
    // TODO: fix bug, where checkbox doesn't updaet image
    return (
      <div className={showHideClassName}>
        <section className="modal-main">
          <form action="" id="preferences form">
            <p>
              <label htmlFor={Constants.SHOWROOMSONLY}>Show rooms only
              <input type="checkbox" id={Constants.SHOWROOMSONLY} value={this.get(Constants.SHOWROOMSONLY)} onChange={this.onChange.bind(this)}></input>
              <img src={(this.get(Constants.SHOWROOMSONLY)) ? 'images/tick.png' : 'images/cross.png'}></img>
              </label>
            </p>
            <p><label htmlFor={Constants.NEWROOMWHERE}>New room where? </label> <span>
              <select id={Constants.NEWROOMWHERE} value={this.get(Constants.NEWROOMWHERE)} onChange={this.onChange.bind(this)}>
              {Constants.WHEREOPTIONS.map((item, i) =>  <option value={item} key={i}>{item}</option>)}
              </select></span>
            </p>
            <p><label htmlFor={Constants.NEWITEMWHERE}>New item where? </label> <span>
              <select id={Constants.NEWITEMWHERE} value={this.get(Constants.NEWITEMWHERE)} onChange={this.onChange.bind(this)}>
              {Constants.WHEREOPTIONS.map((item, i) =>  <option value={item} key={i}>{item}</option>)}
              </select></span>
            </p>
            <p><label htmlFor={Constants.AUTOSAVEINTERVAL}>Autosave interval </label>
              <span>
              <input type="text" id={Constants.AUTOSAVEINTERVAL} value={this.get(Constants.AUTOSAVEINTERVAL)} onChange={this.onChange.bind(this)}></input>
              </span>
            </p>
            <p><label htmlFor={Constants.DARKMODE}>Dark mode </label>
              <span>
              <input type="checkbox" id={Constants.DARKMODE} value={this.get(Constants.DARKMODE)} onChange={this.onChange.bind(this)}></input>
              <img src={this.get(Constants.DARKMODE) ? 'images/tick.png' : 'images/cross.png'}></img>
              </span>
            </p>
          </form>
          <button onClick={this.hidePreferences.handleClose}>close</button>
        </section>
      </div>
    )
  }
}
