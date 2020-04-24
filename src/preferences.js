import React, {Component} from 'react'
import Store from 'electron-store'

const defaultPreferences = {
  jsShowRoomsOnly: false,
  jsNewRoomWhere: 'Top',
  jsNewItemWhere: 'Location',
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
              <label htmlFor="jsShowRoomsOnly">Show rooms only
              <input type="checkbox" id="jsShowRoomsOnly" value={this.get('jsShowRoomsOnly')} onChange={this.onChange.bind(this)}></input>
              <img src={(this.get('jsShowRoomsOnly')) ? 'images/tick.png' : 'images/cross.png'}></img>
              </label>
            </p>
            <p><label htmlFor="jsNewRoomWhere">New room where? </label> <span>
              <select id="jsNewRoomWhere" value={this.get('jsNewRoomWhere')} onChange={this.onChange.bind(this)}>
                <option value="Top">Top</option>
                <option value="Zone">Zone</option>
                <option value="Location">Location</option>
                <option value="Anywhere">Anywhere</option>
              </select></span>
            </p>
            <p><label htmlFor="jsNewItemWhere">New item where? </label> <span>
              <select id="jsNewItemWhere" value={this.get('jsNewItemWhere')} onChange={this.onChange.bind(this)}>
                <option value="Top">Top</option>
                <option value="Zone">Zone</option>
                <option value="Location">Location</option>
                <option value="Anywhere">Anywhere</option>
              </select></span>
            </p>
            <p><label htmlFor="jsAutosaveInterval">Autosave interval </label>
              <span>
              <input type="text" id="jsAutosaveInterval" value={this.get('jsAutosaveInterval')} onChange={this.onChange.bind(this)}></input>
              </span>
            </p>
            <p><label htmlFor="darkMode">Dark mode </label>
              <span>
              <input type="checkbox" id="darkMode" value={this.get('darkMode')} onChange={this.onChange.bind(this)}></input>
              <img src={this.get('jsShowRoomsOnly') ? 'images/tick.png' : 'images/cross.png'}></img>
              </span>
            </p>
          </form>
          <button onClick={this.hidePreferences.handleClose}>close</button>
        </section>
      </div>
    )
  }
}
