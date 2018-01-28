import React, { Component } from 'react';
import PrimaryOptionBar from './../navigation/primaryoptionbar.js';
import ContentMain from './../homepage/ContentMain.js';
import Enums from './../Constants/Enums.js';
import NavBar from './../navigation/navBar.js';
import RegistrationNavBar from './../Registration/RegistrationNavBar.js';

class HomePage extends Component {
  constructor(props){
    super(props);
    this.changeTab = this.changeTab.bind(this);
    this.state = {
      selectedTab: Enums.TAB_NAMES.ADMIN
    };
  }

  changeTab(tabName) {
    this.setState({
      selectedTab:tabName
    });
  }

  render() {
    return (
      <div>
        <RegistrationNavBar />
        <PrimaryOptionBar changeTab={this.changeTab}/>
        <ContentMain selectedTab={this.state.selectedTab}/>
      </div>
    )
  }
}

export default HomePage;
