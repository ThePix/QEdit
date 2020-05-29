import React from 'react'
import { Header, ButtonToolbar, ButtonGroup, IconButton, Icon } from 'rsuite'
import * as Constants from './constants'

export default class Toolbar extends React.Component {
  render() {
    const {objects, newGame, openGame, saveGame, search} = this.props
// TODO: Add functionality to missing buttons
    return(
      <Header style={{height:Constants.TOOLBARHEIGHT}}>
      <ButtonToolbar>
        <ButtonGroup>
          <IconButton
            name={"new"}
            title={"New game"}
            icon={<Icon icon="file"/>}
            onClick={newGame}
          />
          <IconButton
            name={"open"}
            title={"Open game"}
            icon={<Icon icon="folder-open"/>}
            onClick={openGame}
          />
          <IconButton
            name={"save"}
            title={"Save game"}
            icon={<Icon icon="save"/>}
            onClick={saveGame}
          />
        </ButtonGroup>
        <ButtonGroup>
          <IconButton
            name="cut"
            title={"Cut"}
            icon={<Icon icon="cut"/>}
            onClick={() => {document.execCommand('cut')}}
          />
          <IconButton
            name="copy"
            title={"Copy"}
            icon={<Icon icon="copy-o"/>}
            onClick={() => {document.execCommand('copy')}}
          />
          <IconButton
            name="paste"
            title={"Paste"}
            icon={<Icon icon="paste"/>}
            onClick={() => {document.execCommand('paste')}}
          />
        </ButtonGroup>
        <ButtonGroup>
          <IconButton
            name="undo"
            title={"Undo"}
            icon={<Icon icon="undo"/>}
          />
          <IconButton
            name="redo"
            title={"Redo"}
            icon={<Icon icon="repeat"/>}
          />
        </ButtonGroup>
        <ButtonGroup>
          <IconButton
            name="new location"
            title={"New location"}
            icon={<Icon icon={Constants.OBJTYPE_ICONS.room}/>}
            onClick={() => objects.addObject(Constants.ROOM_TYPE)}
          />
          <IconButton
            name="new item"
            title={"New item"}
            icon={<Icon icon={Constants.OBJTYPE_ICONS.item}/>}
            onClick={() => objects.addObject(Constants.ITEM_TYPE)}
          />
          <IconButton
            name="new stub"
            title={"New stub"}
            icon={<Icon icon={Constants.OBJTYPE_ICONS.stub}/>}
            onClick={() => objects.addObject(Constants.STUB_TYPE)}
          />
          <IconButton
            name="new function"
            title={"New function"}
            icon={<Icon icon={Constants.OBJTYPE_ICONS.function}/>}
            onClick={() => objects.addObject(Constants.FUNCTION_TYPE)}
          />
          <IconButton
            name="new command"
            title={"New command"}
            icon={<Icon icon={Constants.OBJTYPE_ICONS.command}/>}
            onClick={() => objects.addObject(Constants.COMMAND_TYPE)}
          />
          <IconButton
            name="new template"
            title={"New template"}
            icon={<Icon icon={Constants.OBJTYPE_ICONS.template}/>}
            onClick={() => objects.addObject(Constants.TEMPLATE_TYPE)}
          />
        </ButtonGroup>
        <ButtonGroup>
          <IconButton
            name="back"
            title={"Back"}
            icon={<Icon icon="chevron-left"/>}
          />
          <IconButton
            name="forward"
            title={"Forward"}
            icon={<Icon icon="chevron-right"/>}
          />
        </ButtonGroup>
        <ButtonGroup>
          <IconButton
            name="search"
            title={"Search"}
            icon={<Icon icon="search"/>}
            onClick={search}
          />
          <IconButton
            name="help"
            title={"Help"}
            icon={<Icon icon="question"/>}
          />
        </ButtonGroup>
      </ButtonToolbar>
      </Header>
    )
  }
}
