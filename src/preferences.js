import React from 'react'
import Store from 'electron-store'
import { Modal, Form, FormGroup, ControlLabel, Toggle, SelectPicker, InputNumber
 } from 'rsuite'
import * as Constants from './constants'

const defaultPreferences = {
  jsShowRoomsOnly: false,
  jsNewRoomWhere: Constants.WHERE_TOP,
  jsNewItemWhere: Constants.WHERE_LOCATION,
  jsAutosaveInterval: 1,
  darkMode: false
}
const preferences = new Store({defaults:defaultPreferences})

export default class Preferences extends React.Component {
  static get(key) {
    return preferences.get(key)
  }

  static set(key, value) {
    preferences.set(key, value)
  }

  render() {
    const data = Constants.WHEREOPTIONS.map((el, i) =>
      {return({value: el, label: el})})
    return (
      <Modal show={this.props.show} onHide={() => {this.props.close()}}>
        <Modal.Header>
          <Modal.Title>Preferences</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form layout='horizontal'>
            <FormGroup>
              <ControlLabel>Show rooms only:</ControlLabel>
              <Toggle
                key={Constants.SHOWROOMSONLY}
                defaultChecked={Preferences.get(Constants.SHOWROOMSONLY)}
                onChange={(value) => Preferences.set(Constants.SHOWROOMSONLY, value)}
                style={{marginTop:5}}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>New room where?</ControlLabel>
              <SelectPicker
                key={Constants.NEWROOMWHERE}
                style={Constants.INPUTCOMPONENT_STYLE}
                data={data}
                defaultValue={Preferences.get(Constants.NEWROOMWHERE)}
                onChange={(value) => Preferences.set(Constants.NEWROOMWHERE, value)}
                cleanable={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>New item where?</ControlLabel>
              <SelectPicker
                key={Constants.NEWITEMWHERE}
                style={Constants.INPUTCOMPONENT_STYLE}
                data={data}
                defaultValue={Preferences.get(Constants.NEWITEMWHERE)}
                onChange={(value) => Preferences.set(Constants.NEWITEMWHERE, value)}
                cleanable={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Autosave interval:</ControlLabel>
              <InputNumber
                key={Constants.AUTOSAVEINTERVAL}
                style={Constants.INPUTCOMPONENT_STYLE}
                defaultValue={defaultPreferences.jsAutosaveInterval}
                min={0}
                max={100}
                onChange={(value) =>{
                  console.log(value)
                  Preferences.set(Constants.AUTOSAVEINTERVALVALUE, value.toString())
                  console.log(Constants.AUTOSAVEINTERVALVALUE)
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Dark mode:</ControlLabel>
              <Toggle
                key={Constants.DARKMODE}
                defaultChecked={Preferences.get(Constants.DARKMODE)}
                onChange={(value) => Preferences.set(Constants.DARKMODE, value)}
                style={{marginTop:5}}
              />
            </FormGroup>
          </Form>
        </Modal.Body>
      </Modal>
    )
  }
}
