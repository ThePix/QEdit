import React from 'react'
import { Grid, Row, Col , Button, FormGroup, RadioGroup, Radio,
  ControlLabel } from 'rsuite'
import * as Constants from '../constants'
import {Title, SelectExit, TextAreaUseType, SelectDoor, TextDoor} from '../inputcomponents'

const {lang} = require('../' + Constants.QUEST_JS_PATH + 'lang/lang-en.js')

export default class Exits extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: undefined
    }
  }

  rows() {
    const data = []
    for (var i = 0; i < 3; i++) {
      data.push(
        <Row gutter={16} style={{marginBottom:10}} key={'row_'+i}>
          {this.columns(i)}
        </Row>
      )
    }
    return(data)
  }

  columns(row) {
    const data = []
    for (var i = 0; i < 5; i++) {
      data.push(
        <Col xs={4} xsPull={1} key={'col_'+i}>
          {this.exitButton(lang.exit_list[i + 5 * row])}
        </Col>
      )
    }
    return(data)
  }

  exitButton(langexit) {
    if(langexit.nocmd) return
    const {objects, item} = this.props
    const appearance = (this.state.selected === langexit.name) ?
      "primary" : "ghost"
    const exit = objects.getExit(langexit.name)
    const name = (exit) ? (exit.data.name || <br />) : <br />
    return(
      <Button
        key={langexit.name}
        name={langexit.name}
        appearance={appearance}
        onClick={() => {this.setState({selected:langexit.name})}}
        style={{width:'100%'}}
      >
        <b>{langexit.name}</b>
        <br/>
        {name}
      </Button>
    )
  }

  exitDetails() {
    const {selected} = this.state
    const {objects} = this.props
    if(!selected) return
    const exit = objects.getExit(selected)
    const value = exit ? exit.data.name : ''
    const usetype = exit ? exit.data.useType : Constants.USETYPE_DEFAULT
    return (
      <div>
        <Title item={{display:selected}} />
        <SelectExit
          objects={objects}
          item={{name:selected, display:'Destination'}}
        />
        {value ?
        <div>
        <FormGroup>
          <ControlLabel>Go to: </ControlLabel>
          <Button
            key={'goto'}
            name={'goto'}
            appearance='ghost'
            onClick={() => objects.setCurrentObjectByName(value)}
          >
          {value}
          </Button>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Action:</ControlLabel>
          <RadioGroup
            key={'usetype'}
            inline
            style={Constants.INPUTCOMPONENT_STYLE}
            defaultValue={usetype}
            onChange={(value) => objects.setExitData(selected, {useType:value})}
          >
            <Radio value={Constants.USETYPE_DEFAULT}>Default action</Radio>
            <Radio value={Constants.USETYPE_MSG}>Message script</Radio>
            <Radio value={Constants.USETYPE_CUSTOM}>Custom script</Radio>
            <Radio value={Constants.USETYPE_DOOR}>Standard door script</Radio>
          </RadioGroup>
        </FormGroup>
        {this.exitOptions()}
        </div> :
        ''}
      </div>
    )
  }

  exitOptions() {
    const {objects} = this.props
    const {selected} = this.state
    const usetype = objects.getExit(this.state.selected).data.useType
// TODO: move item definitons to the json files, so they don't need to be created here,if possible
    switch (usetype) {
      case Constants.USETYPE_MSG:
        return(
            <TextAreaUseType
              objects={objects}
              item={{
                name: selected,
                display:'Message',
                tooltip:'A script, with a local variable, "char", the player or NPC.'
              }}
              usetype={'msg'}
            />
        )
      case Constants.USETYPE_CUSTOM:
        return(
            <TextAreaUseType
              objects={objects}
              item={{
                name: selected,
                display:'Script',
                tooltip:'A script, with two local variables; "char", the player or NPC and "dir", the direction.'
              }}
              usetype={'use'}
            />
        )
      case Constants.USETYPE_DOOR:
        return(
          <div>
            <SelectDoor
              objects={objects}
              item={{
                name:selected,
                display:'Door',
                tooltip:'Select the object that will be the door.'
              }}
            />
            <TextDoor
              objects={objects}
              item={{
                name:selected,
                display:'Door name',
                tooltip:'This is how the player will see the door described.'
              }}
            />
          </div>
        )
    }
  }

  render() {
    return (
      <div>
        <Grid fluid>{this.rows()}</Grid>
        {this.exitDetails()}
      </div>
    )
  }
}
