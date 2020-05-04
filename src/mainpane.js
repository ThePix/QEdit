import React from 'react'
import { Container, Icon, IconButton, Form, FormGroup, FormControl, Schema, Header } from 'rsuite'
import TabPane from './tabpane'
import * as Constants from './constants'

const { StringType } = Schema.Types

const iconStyles = {
  paddingRight: 12,
  paddingLeft: 12,
  fontSize: 36
}

const buttonStyles = {
  marginLeft: 50
}

const inputStyles = {
  borderWidth: 0,
  fontSize: 36
}

var names

function asyncCheckObjectname(name) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (names.includes(name)) {
        resolve(false)
      } else {
        resolve(true)
      }
    }, 500)
  })
}

const model = Schema.Model({
  name: StringType()
    .pattern(/^[a-zA-Z_][\w]*$/,
      'Can only contain letters, digits and underscores; it cannot start with a number')
    .addRule((value, data) => {return asyncCheckObjectname(value)},
      'Duplicate object name')
    .isRequired('The name is required.')
})

export default class MainPane extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      formValue: {
        name: this.props.objects.getName()
      },
      formError: {},
      mouseover: false
    }
    this.handleCheck = this.handleCheck.bind(this)
    this.handleChangeCurrentObject = this.handleChangeCurrentObject.bind(this)
  }

  componentDidMount() {
    this.props.objects.on(Constants.CHANGE_CURRENT_OBJECT_EVENT,
      () => {this.handleChangeCurrentObject()})
  }

  componentWillUnmount() {
    this.props.objects.off(Constants.CHANGE_CURRENT_OBJECT_EVENT,
      () => {this.handleChangeCurrentObject()})
  }

  handleChangeCurrentObject() {
    const { formValue }  = this.state
    formValue.name = this.props.objects.getName()
    this.forceUpdate()
  }

  handleCheck(formError) {
    this.setState({ formError })
    if(!formError.formError.name) {
      this.props.objects.setName(this.state.formValue.name)
    }
  }

  render() {
    const {formError, formValue } = this.state
    const {objects} = this.props
    const current = objects.getCurrentObject()
    names = objects.getObjectNames().filter(o => o !== objects.getName())

    return (
      <Container style={Constants.MAINCONTAINER_STYLE}>
        <Header>
          <div>
            <Form
              ref={ref => (this.form = ref)}
              onChange={formValue => {this.setState({ formValue })}}
              onCheck={formError => {this.handleCheck({ formError})}}
              formValue={formValue}
              model={model}
              onMouseEnter={() => {this.setState({mouseover: true})}}
              onMouseLeave={() => {this.setState({mouseover: false})}}
              onBlur={this.handleChangeCurrentObject}
            >
              <FormGroup>
                <Icon
                  style={iconStyles}
                  size='lg'
                  icon={Constants.OBJTYPE_ICONS[current.jsObjType]}
                />
                <FormControl
                  style={inputStyles}
                  checkAsync
                  name="name"
                  size="lg"
                />
                {this.state.mouseover ?
                  <IconButton
                    name="delete"
                    style={buttonStyles}
                    appearance="subtle"
                    icon={<Icon icon="times-circle"/>}
                    circle
                    size="xs"
                    color="red"
                    onClick={() => objects.removeObject()}
                  />
                  : ''
                }
              </FormGroup>
            </Form>
          </div>
        </Header>
        <Container style={{height:'100%'}}>
          <TabPane objects={objects} />
        </Container>
      </Container>
    )
  }
}
