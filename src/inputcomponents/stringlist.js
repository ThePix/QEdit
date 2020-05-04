import React from 'react'
import { FormGroup, List, Input, ControlLabel, HelpBlock, IconButton, Icon,
  Container, Content, Sidebar, Modal, Button} from 'rsuite'
import * as Constants from '../constants'

const addStyles = {
  marginLeft:'calc(170px + ' + Constants.COMPONENTWIDTH + 'px)',
  marginTop:5
}

export default class StringList extends React.Component {
  constructor(props) {
    super(props)
    const {item, objects} = props
    this.state = {
      show: false,
      edit: false,
      index: 0
    }

    this.openAdd = this.openAdd.bind(this)
    this.openEdit = this.openEdit.bind(this)
    this.close = this.close.bind(this)
  }

  openAdd() {
    this.setState({show:true, edit:false})
  }

  openEdit(index) {
    this.setState({show:true, edit:true, index:index})
  }

  close() {
    this.setState({ show: false })
  }

  render() {
    const {objects, item} = this.props
    const value = objects.getValue(item.name) || item.default

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <List hover style={Constants.INPUTCOMPONENT_STYLE}>
          {value.map((el,index)=>
            <List.Item key={index} index={index}>
              <Container>
                <Content>
                {el}
                </Content>
                <Sidebar width={50}>
                  <Edit
                    objects={objects}
                    item={item}
                    index={index}
                    open={this.openEdit}
                  />
                  <Delete objects={objects} item={item} index={index} />
                </Sidebar>
              </Container>
            </List.Item>
          )}
        </List>
        <IconButton
          appearance="subtle"
          style={addStyles}
          name={"add"}
          icon={<Icon icon="plus-square"/>}
          size="xs"
          color="green"
          onClick={this.openAdd}
        />
        <InputModal
          show={this.state.show}
          edit={this.state.edit}
          value={value}
          objects={objects}
          item={item}
          close={this.close}
          index={this.state.index}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}

class Edit extends React.Component {
  render() {
    const {index} = this.props
    return(
      <IconButton
        appearance="subtle"
        name={"edit_" + index}
        icon={<Icon icon="pencil-square"/>}
        size="xs"
        color="orange"
        onClick={() => this.props.open(this.props.index)}
      />
    )
  }
}

class Delete extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
      const {objects, item, index} = this.props
      const value = objects.getValue(item.name) || item.default

      value.splice(index, 1)
      objects.setValue(item.name, value)
  }

  render() {
    const {index} = this.props

    return (
      <IconButton
        appearance="subtle"
        name={"delete_" + index}
        circle
        icon={<Icon icon="times-circle"/>}
        size="xs"
        color="red"
        onClick={this.handleClick}
      />
    )
  }
}

class InputModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      newItem: undefined
    }

    this.close = this.close.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  close() {
    this.setState({ newItem: undefined})
    this.props.close()
  }

  handleClick() {
    const {newItem} = this.state
    const {item, value, objects} = this.props

    if (newItem) {
      if (this.props.edit) {
        value[this.props.index] = newItem
      }
      else {
        value.push(newItem)
      }
      objects.setValue(item.name, value)
    }
    this.close()
  }

  handleChange(value) {
    this.setState({newItem: value})
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      this.handleClick()
    }
  }

  render() {
    const {edit, value, index, show} = this.props
    const newItem = (!this.state.newItem && edit) ? value[index] : ''

    return(
      <Modal size='xs' show={show} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>
            {edit ? 'Edit item' : 'Add item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            key='newItem'
            defaultValue={newItem}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleClick} appearance="primary">
            Ok
          </Button>
          <Button onClick={this.close} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
