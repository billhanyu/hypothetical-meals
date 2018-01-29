import React, { Component } from 'react';

class RegistrationHeader extends Component {
  constructor(props){
    super(props);
  }

  /*** REQUIRED PROPS
    1. HeaderText (String)
    2. HeaderIcon (String)
  */

  render() {
    return (
      <div className="RegistrationHeader">
        <i className={`${this.props.HeaderIcon} RegistrationPersonIcon`}></i>
        <span className="RegistrationHeaderText">{this.props.HeaderText}</span>
      </div>
    );
  }
}

export default RegistrationHeader;
