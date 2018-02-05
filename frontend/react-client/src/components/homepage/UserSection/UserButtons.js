import React, { Component } from 'react';
import UserButton from '../CommonComponent/UserButton';
import ViewInventory from './inventory/ViewInventory';
import LogOrder from './order/LogOrder';
import CheckOut from './checkout/CheckOut';
import SpendingLog from './spendinglog/SpendingLog';

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
      return <ViewInventory token={this.props.token} mode="view" />;
    } else if (selectedButton == "logOrder") {
      return <LogOrder token={this.props.token} />;
    } else if (selectedButton == "checkOut") {
      return <CheckOut token={this.props.token} />;
    } else if (selectedButton == "spendingLog") {
      return <SpendingLog token={this.props.token} />;
    }
  }

  render() {
    return (
      <div>
        <div className="UserButtonContainer">
          <UserButton name="View Inventory" id="viewInventory" handleClick={this.handleClick} />
          <UserButton name="Log Orders" id="logOrder" handleClick={this.handleClick} />
          <UserButton name="Check Out" id="checkOut" handleClick={this.handleClick} />
          <UserButton name="Spending Report" id="spendingLog" handleClick={this.handleClick} />
        </div>
        {
          this._renderSelectedButton()
        }
      </div>
    );
  }
}

export default UserButtons;
