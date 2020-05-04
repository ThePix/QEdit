import React from 'react'
import { Form } from 'rsuite'
import {Select, Text, Exits, SelectPronouns, Objects, OtherObjects, Flag,
  TodoList, TextArea, Title, ScriptString, Script, StringList, ReadOnly, String,
  Regex, Id, LongText, LongString, Int} from './inputcomponents'
import * as Constants from './constants'

const inputMapping = {
  text: Text,
  select: Select,
  exits: Exits,
  selectpronouns: SelectPronouns,
  objects: Objects,
  otherobjects: OtherObjects,
  flag: Flag,
  todolist: TodoList,
  textarea: TextArea,
  title: Title,
  scriptstring: ScriptString,
  script: Script,
  stringlist: StringList,
  readonly: ReadOnly,
  string: String,
  regex: Regex,
  id: Id,
  longtext: LongText,
  longstring: LongString,
  int: Int,
}

const styles = {
  height: 'calc(100% - ' + Constants.TABHEIGHT + 'px)',
  overflow: 'auto',
  paddingTop: 10,
  width: Constants.CONTROLPANEWIDTH
}
export default class ControlPane extends React.Component {
  constructor(props) {
    super(props)
  }

  renderComponent(item, index) {
    const InputComponent = inputMapping[item.type]
    if(InputComponent) {
      return (
        <InputComponent
          key={'component_' + index}
          item={item}
          objects={this.props.objects}
        />
      )
    }
    else console.log('Type not recognised: ' + item.type)
  }

  render() {
    return(
      <Form layout='horizontal' style={styles}>
      {this.props.controls.map((el, i) => this.renderComponent(el, i))}
      </Form>
    )
  }
}
