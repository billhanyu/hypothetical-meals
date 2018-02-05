import React, { Component } from 'react';
import AdminButton from '../CommonComponent/UserButton';
import AddIngredientWindow from './AddIngredientWindow.js';
import IngredientList from './EditIngredient/IngredientList.js';
import AddVendor from './AddVendor.js';
import VendorList from './EditVendor/VendorList.js';
import VendorIngredientList from './EditVendorIngredient/VendorIngredientList.js';
import AddVendorIngredientList from './EditVendorIngredient/AddVendorIngredientList.js';
import EditStorageCapacity from './Storage/EditStorageCapacity.js';
import InventoryList from './InventoryQuantity/InventoryList.js';

class AdminButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderedButton:"",
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
    if (selectedButton == "editVendor") {
        return <VendorList token={this.props.token}/>
    }
    else if (selectedButton == "addVendor") {
        return <AddVendor token={this.props.token}/>
    }
    else if (selectedButton == "editIngredient") {
        return <IngredientList token={this.props.token}/>
    }
    else if (selectedButton == "addIngredient") {
        return <AddIngredientWindow token={this.props.token}/>
    }
    else if (selectedButton == "editVendorIngredient") {
        return <VendorIngredientList token={this.props.token}/>
    }
    else if (selectedButton == "addVendorIngredient") {
        return <AddVendorIngredientList token={this.props.token}/>
    }
    else if (selectedButton == "editStorage") {
        return <EditStorageCapacity token={this.props.token} />
    }
    else if (selectedButton == 'inventoryQuantity') {
      return <InventoryList token={this.props.token} />
    }

  }

  render() {
    return (
      <div>
        <div className="AdminButtonContainer">
          <AdminButton name="Edit Vendor" id="editVendor" handleClick={this.handleClick}/>
          <AdminButton name="Add Vendor" id="addVendor" handleClick={this.handleClick}/>
          <AdminButton name="Edit Ingredient" id="editIngredient" handleClick={this.handleClick}/>
          <AdminButton name="Add Ingredient" id="addIngredient" handleClick={this.handleClick}/>
          <AdminButton name="Edit VendorIngedient" id="editVendorIngredient" handleClick={this.handleClick}/>
          <AdminButton name="Add VendorIngredient" id="addVendorIngredient" handleClick={this.handleClick}/>
          <AdminButton name="Edit Storage" id="editStorage" handleClick={this.handleClick}/>
          <AdminButton name="Edit Inventory Size" id="inventoryQuantity" handleClick={this.handleClick} />
        </div>
        {
          this._renderSelectedButton()
        }
      </div>
    );
  }
}

export default AdminButtons;
