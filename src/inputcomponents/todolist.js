import React from 'react'
import { FormGroup, Message, Button, List } from 'rsuite'

export default class TodoList extends React.Component {
  render() {
    const {item, objects} = this.props
    const value = objects.getValue(item.name) || item.default
    return (
      <FormGroup>
        <Message
          type="warning"
          title="Warning"
          showIcon
          description={
            <p>
              These issues were identified when this game was converted from Quest 5.
              <br />
              Press the button when you are certain they are resolved to delete the whole list.
            </p>
          }
        />
        <Button
          appearance="primary"
          key={item.name}
          onClick={(v) => objects.removeConversionNotes()}>
          Remove notes
        </Button>
        <List hover>
          {value.map((el, i)=> <List.Item key={i} index={i}>{el}</List.Item>)}
        </List>
      </FormGroup>
    )
  }
}
