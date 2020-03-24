import React from 'react';

export class TreeLink extends React.Component {
  
  getIcons() {
    if (!this.props.object.icon || this.props.object === '') return ''
    return (<img src={'images/' + this.props.object.icon + '.png'} key={this.props.object.name + '_icon'}></img>)
  }

  render() {
    const {object, showObject} = this.props;
    let className = "tree " + object.treeStyleClass();
    if (object === this.props.selected) className += " treeSelected";
    
    return  (<a onClick={() => showObject(object.name)} className={className}>
      <span style={{color:object.jsColour}}>{object.name}</span>
      {this.getIcons()}
    </a>)
  }
}