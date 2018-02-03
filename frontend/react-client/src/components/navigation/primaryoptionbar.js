import React, { Component } from 'react';
import PrimaryOption from './primaryoption.js';

// COMPONENT INFO: Refers to the main window changer when logged in, underneath the nav-NavBar

class PrimaryOptionBar extends Component {
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
    const buttons = [
      {
        name:'Records',
        icon:'fas fa-columns fa-lg'
      }
    ];

    if(props.isAdmin == 'true') {
      buttons.push(
      {
        name:'Admin',
        icon:'fas fa-user fa-lg'
      });
    }

    this.state = {
      selectedButton:'Records',
      buttons,
    };
  }
  /**
    Required Props:
    1. changeTab (Func) Fired when u change tab
    2. isAdmin (boolean)
  */

  handleClick(selectedButton){
    this.props.changeTab(selectedButton.toUpperCase());
    return this.setState({
      selectedButton: selectedButton
    });
  }

  render() {
    return (
      <div className="borderBottom">
        <div className="primaryoptionbar">
          {
            this.state.buttons.map((element, index) => {
            return <PrimaryOption
                    key={index}
                    buttonName={element.name}
                    isSelectedButton={element.name == this.state.selectedButton}
                    buttonIcon={element.icon}
                    handleClick={this.handleClick} />
            })
          }
        </div>
      </div>
    )
  }
}

export default PrimaryOptionBar;
