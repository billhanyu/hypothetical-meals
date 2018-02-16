import React, { Component } from 'react';
import NavBar from './../Registration/RegistrationNavBar';
import SideBar from '../navigation/SideBar';
import { withRouter } from 'react-router';
import Cookies from 'universal-cookie';
import logoutFunc from '../homepage/LogOut';

import AddIngredientWindow from '../homepage/AdminSection/AddIngredientWindow';
import IngredientList from '../homepage/AdminSection/EditIngredient/IngredientList';
import NewIngredientList from '../homepage/ingredient/IngredientList';
import AddVendor from '../homepage/AdminSection/AddVendor';
import VendorList from '../homepage/AdminSection/EditVendor/VendorList';
import BulkImport from '../homepage/AdminSection/BulkImport';
import VendorIngredientList from '../homepage/AdminSection/EditVendorIngredient/VendorIngredientList';
import AddVendorIngredientList from '../homepage/AdminSection/EditVendorIngredient/AddVendorIngredientList';
import EditStorageCapacity from '../homepage/AdminSection/Storage/EditStorageCapacity';
import InventoryList from '../homepage/AdminSection/InventoryQuantity/InventoryList';
import ViewInventory from '../homepage/UserSection/inventory/ViewInventory';
import LogOrder from '../homepage/UserSection/order/LogOrder';
import CheckOut from '../homepage/UserSection/checkout/CheckOut';
import SpendingLog from '../homepage/UserSection/spendinglog/SpendingLog';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      funcName: 'viewIngredients',
    };
    this.cookies = new Cookies();
    this.logout = this.logout.bind(this);
    this.link = this.link.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
  }

  logout() {
    logoutFunc(this.cookies, this.props.history);
  }

  link(funcName) {
    this.setState({
      funcName
    });
  }

  renderComponent() {
    const funcName = this.state.funcName;
    if (funcName == "editVendor") {
      return <VendorList />;
    }
    else if (funcName == "addVendor") {
      return <AddVendor />;
    }
    else if (funcName == "editIngredient") {
      return <IngredientList />;
    }
    else if (funcName == "addIngredient") {
      return <AddIngredientWindow />;
    }
    else if (funcName == "editVendorIngredient") {
      return <VendorIngredientList />;
    }
    else if (funcName == "addVendorIngredient") {
      return <AddVendorIngredientList />;
    }
    else if (funcName == "editStorage") {
      return <EditStorageCapacity />;
    }
    else if (funcName == 'inventoryQuantity') {
      return <InventoryList />;
    }
    else if (funcName == "bulkImport") {
      return <BulkImport />;
    }
    else if (funcName == "viewInventory") {
      return <ViewInventory mode="view" />;
    }
    else if (funcName == "logOrder") {
      return <LogOrder />;
    }
    else if (funcName == "checkOut") {
      return <CheckOut />;
    }
    else if (funcName == "spendingLog") {
      return <SpendingLog />;
    }
    else if (funcName == "viewIngredients") {
      return <NewIngredientList />;
    }
  }

  render() {
    return (
      <div className="container-fluid appcontainer">
        <NavBar />
        <div className="row row-nomargin">
          <SideBar
            logout={this.logout}
            link={this.link}
          />
          <div className="ContentMain col-sm-8 col-md-9 col-lg-10 col-xl-10">
            {this.renderComponent()}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(HomePage);
