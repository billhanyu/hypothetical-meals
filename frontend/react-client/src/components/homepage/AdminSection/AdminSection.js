import React, { Component } from 'react';
import AdminButtons from './AdminButtons.js';

class AdminSection extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
  1. token (String)
  */

  render() {
    return (
      <div>
        <AdminButtons token={this.props.token}/>
      </div>
    )
  }
}

export default AdminSection;
