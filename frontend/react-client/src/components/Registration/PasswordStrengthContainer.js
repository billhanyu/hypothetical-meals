import React, { Component } from 'react';

class PasswordStrengthContainer extends Component {
  constructor(props){
    super(props);
    this._renderBars = this._renderBars.bind(this);
  }
  /******* REQUIRED PROPS
    1. passwordText (String)
  ***********/

  _renderBars(password) {
    if(password.length < 3){
      return (
        <div>
          <div className="PasswordBar PasswordBarAnchor WeakPasswordBGColor"></div>
          <div className="PasswordBar BlankPassword"></div>
          <div className="PasswordBar BlankPassword"></div>
          <div className="PasswordStrengthText WeakPasswordColor"> WEAK </div>
        </div>
      );
    }
    else if(password.length < 7){
      return (
        <div>
          <div className="PasswordBar PasswordBarAnchor GoodPasswordBGColor"></div>
          <div className="PasswordBar GoodPasswordBGColor"></div>
          <div className="PasswordBar BlankPassword"></div>
          <div className="PasswordStrengthText GoodPasswordColor"> GOOD </div>
        </div>
      );
    }

    return (
      <div>
        <div className="PasswordBar PasswordBarAnchor ExcellentPasswordBGColor"></div>
        <div className="PasswordBar ExcellentPasswordBGColor"></div>
        <div className="PasswordBar ExcellentPasswordBGColor"></div>
        <div className="PasswordStrengthText ExcellentPasswordColor"> EXCELLENT </div>
      </div>
    );
  }

  render() {
    return (
      <div className="PasswordStrengthContainer">
        {
          this._renderBars(this.props.passwordText)
        }
      </div>
    )
  }
}

export default PasswordStrengthContainer;
