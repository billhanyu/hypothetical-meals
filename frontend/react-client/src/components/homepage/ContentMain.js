import React, { Component } from 'react';
import AdminSection from './AdminSection/AdminSection.js';
import Enums from './../Constants/Enums.js';

// COMPONENT INFO: Refers main content window
class ContentMain extends Component {
  constructor(props) {
    super(props);
    /**
      Required Props:
      1. selectedTab (String)
    */
  }

  _renderSelectedTab() {
    if(this.props.selectedTab == Enums.TAB_NAMES.RECORDS) {
      return <AdminSection />;
    }
    else if(this.props.selectedTab == Enums.TAB_NAMES.ADMIN){
      return <AdminSection />;
    }
  }

  render() {
    return (
      <div className="homeBG">
        {
          this._renderSelectedTab()
        }
      </div>
    )
  }
}

export default ContentMain;
