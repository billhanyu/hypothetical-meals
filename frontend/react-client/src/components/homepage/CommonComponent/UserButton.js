import React, { Component } from 'react';

class UserButton extends Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /*** REQUIRED PROPS
    1. handleClick (Func)
    2. name (String)
    3. id (String)
  */
  _handleClick() {
    this.props.handleClick(this.props.id);
  }

  render() {
    return (
      <div className="AdminButton" onClick={this._handleClick}>
        {this.props.name}
      </div>
    );
  }
}

export default UserButton;
