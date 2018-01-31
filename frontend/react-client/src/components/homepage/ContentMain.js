import React, { Component } from 'react';
import AdminSection from './AdminSection/AdminSection.js';
import UserSection from './UserSection/UserSection';
import Enums from './../Constants/Enums.js';

// COMPONENT INFO: Refers main content window
class ContentMain extends Component {
  constructor(props) {
    super(props);
    /**
      Required Props:
      1. selectedTab (String)
      2. token (String)
    */
  }

  _renderSelectedTab() {
    if(this.props.selectedTab == Enums.TAB_NAMES.RECORDS) {
      return <UserSection token={this.props.token}/>;
    }
    else if(this.props.selectedTab == Enums.TAB_NAMES.ADMIN) {
      return <AdminSection token={this.props.token}/>;
    }
  }

  render() {
    return (
      <div className="homeBG">
        {
          this._renderSelectedTab()
        }
      </div>
    );
  }
}

export default ContentMain;
