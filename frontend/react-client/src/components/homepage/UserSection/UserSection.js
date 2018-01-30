import React, { Component } from 'react';
import UserButtons from './UserButtons.js';

class UserSection extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
  1. token (String)
  */

  render() {
    return (
      <div>
        <UserButtons token={this.props.token} />
      </div>
    );
  }
}

export default UserSection;
