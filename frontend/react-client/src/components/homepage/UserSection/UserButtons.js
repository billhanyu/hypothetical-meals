import React, { Component } from 'react';
import UserButton from '../CommonComponent/UserButton';
import ViewInventory from './Buttons/ViewInventory';

class UserButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderedButton: "",
    };
    this.handleClick = this.handleClick.bind(this);
  }
  /** REQUIRED PROPS
    1. token (String)
  */

  handleClick(idOfButton) {
    this.setState({
      renderedButton: idOfButton,
    });
  }

  _renderSelectedButton() {
    const selectedButton = this.state.renderedButton;
    if (selectedButton == "viewInventory") {
      return <ViewInventory token={this.props.token} />;
    }
  }

  render() {
    return (
      <div>
        <div className="AdminButtonContainer">
          <UserButton name="View Inventory" id="viewInventory" handleClick={this.handleClick} />
        </div>
        {
          this._renderSelectedButton()
        }
      </div>
    );
  }
}

export default UserButtons;
