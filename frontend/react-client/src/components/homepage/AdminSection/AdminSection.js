import React, { Component } from 'react';
import AdminButtons from './AdminButtons.js';

class AdminSection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <AdminButtons />
      </div>
    )
  }
}

export default AdminSection;
