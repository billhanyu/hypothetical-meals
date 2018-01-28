import React, { Component } from 'react';
import AdminButton from './AdminButton.js';
import AddIngredientWindow from './AddIngredientWindow.js';
import EditIngredientWindow from './EditIngredientWindow.js';
import AddVendor from './AddVendor.js';
import EditVendor from './EditVendor.js'

class AdminButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderedButton:"",
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(idOfButton) {
    this.setState({
        renderedButton: idOfButton,
    });
  }

  _renderSelectedButton() {
    const selectedButton = this.state.renderedButton;
    if (selectedButton == "editVendor") {
        return <EditVendor />
    }
    else if (selectedButton == "addVendor") {
        return <AddVendor />
    }
    if (selectedButton == "editIngredient") {
        return <EditIngredientWindow />
    }
    else if (selectedButton == "addIngredient") {
        return <AddIngredientWindow />
    }

  }

  render() {
    return (
      <div className="AdminButtonContainer">
        <AdminButton name="Edit Vendor" id="editVendor" handleClick={this.handleClick}/>
        <AdminButton name="Add Vendor" id="addVendor" handleClick={this.handleClick}/>
        <AdminButton name="Edit Ingredient" id="editIngredient" handleClick={this.handleClick}/>
        <AdminButton name="Add Ingredient" id="addIngredient" handleClick={this.handleClick}/>
        {
          this._renderSelectedButton()
        }
      </div>
    );
  }
}

export default AdminButtons;
