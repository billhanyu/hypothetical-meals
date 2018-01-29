import React, { Component } from 'react';

class StandardButton extends Component {
  constructor(props) {
    super(props);
  }
  /** REQUIRED PROPS
      1. ButtonIcon / Text (String)
      2. buttonClass (String)
      3. onClick (Function)
  */

  render() {
    return (
      <div className={`${this.props.buttonClass}`} onClick={this.props.onClick}>
        <i className={`${this.props.ButtonIcon} SearchButtonIconImage`}></i>
      </div>
    )
  }
}

export default StandardButton;
