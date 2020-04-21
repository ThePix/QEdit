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

export class Preferences extends React.Component {
  onChange(newValue) {
      preferences.set(newValue.target.id, newValue.target.value)
      // TODO: Check if this is needed.
      this.forceUpdate()
  }

  render() {
    const showHideClassName = this.props.show ? "modal display-block" : "modal display-none";
    // TODO: fix bug, where checkbox doesn't updaet image
    return (
      <div className={showHideClassName}>
        <section className="modal-main">
          <form action="" id="preferences form">
            <p>
              <label htmlFor="jsShowRoomsOnly">Show rooms only
              <input type="checkbox" id="jsShowRoomsOnly" value={preferences.get('jsShowRoomsOnly')} onChange={this.onChange.bind(this)}></input>
              <img src={(preferences.get('jsShowRoomsOnly')) ? 'images/tick.png' : 'images/cross.png'}></img>
              </label>
            </p>
            <p><label htmlFor="jsNewRoomWhere">New room where? </label> <span>
              <select id="jsNewRoomWhere" value={preferences.get('jsNewRoomWhere')} onChange={this.onChange.bind(this)}>
                <option value="Top">Top</option>
                <option value="Zone">Zone</option>
                <option value="Location">Location</option>
                <option value="Anywhere">Anywhere</option>
              </select></span>
            </p>
            <p><label htmlFor="jsNewItemWhere">New item where? </label> <span>
              <select id="jsNewItemWhere" value={preferences.get('jsNewItemWhere')} onChange={this.onChange.bind(this)}>
                <option value="Top">Top</option>
                <option value="Zone">Zone</option>
                <option value="Location">Location</option>
                <option value="Anywhere">Anywhere</option>
              </select></span>
            </p>
            <p><label htmlFor="jsAutosaveInterval">Autosave interval </label>
              <span>
              <input type="text" id="jsAutosaveInterval" value={preferences.get('jsAutosaveInterval')} onChange={this.onChange.bind(this)}></input>
              </span>
            </p>
            <p><label htmlFor="darkMode">Dark mode </label>
              <span>
              <input type="checkbox" id="darkMode" value={preferences.get('darkMode')} onChange={this.onChange.bind(this)}></input>
              <img src={preferences.get('jsShowRoomsOnly') ? 'images/tick.png' : 'images/cross.png'}></img>
              </span>
            </p>
          </form>
          <button onClick={this.props.handleClose}>close</button>
        </section>
      </div>
    )
  }
}
