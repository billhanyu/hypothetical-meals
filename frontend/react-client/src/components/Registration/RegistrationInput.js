import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class RegistrationContainer extends Component {
  constructor(props){
    super(props);
    this._handleOnChange = this._handleOnChange.bind(this);
  }
  /******* REQUIRED PROPS
    1. inputClass (String)
    2. placeholderText (String)
    2. onChange (Func)
    4. id (String)

          OPTIONAL PROPS
    1. infoText
  ***********/

  _handleOnChange(e) {
    this.props.onChange(this.props.id, e);
  }

  render() {
    return (
      <div className="RegistrationInputContainer">
        <input className={this.props.inputClass} placeholder={this.props.placeholderText} onChange={this._handleOnChange} />
      </div>
    )
  }
}

export default RegistrationContainer;
