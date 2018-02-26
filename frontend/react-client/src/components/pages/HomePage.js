import React, { Component } from 'react';
import NavBar from './../Registration/RegistrationNavBar';
import SideBar from '../navigation/SideBar';
import { withRouter } from 'react-router';
import Cookies from 'universal-cookie';
import logoutFunc from '../homepage/LogOut';

import NewIngredientList from '../homepage/ingredient/IngredientList';
import NewVendorList from '../homepage/vendor/VendorList';
import ViewInventory from '../homepage/inventory/ViewInventory';
import Order from '../homepage/order/Order';
import CheckOut from '../homepage/checkout/CheckOut';
import SpendingLog from '../homepage/spendinglog/SpendingLog';
import StorageList from '../homepage/storage/StorageList';
import Registration from '../Registration/RegistrationContainer';
import ChangePermission from '../homepage/user/ChangePermission';
import NewFormula from '../homepage/Formula/NewFormula.js';
import EditFormula from '../homepage/Formula/EditFormula.js';
import ProduceFormula from '../homepage/inventory/ProduceFormula.js';
import ViewAllFormulas from '../homepage/inventory/ViewAllFormulas.js';
import ProductionLog from '../homepage/productionlog/ProductionLog';

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
    if (funcName == "viewInventory") {
      return <ViewInventory mode="view" />;
    }
    else if (funcName == "register") {
      return <Registration />;
    }
    else if (funcName == "changePermission") {
      return <ChangePermission />;
    }
    else if (funcName == "logOrder") {
      return <Order />;
    }
    else if (funcName == "checkOut") {
      return <CheckOut />;
    }
    else if (funcName == "spendingLog") {
      return <SpendingLog />;
    }
    else if (funcName == "productionLog") {
      return <ProductionLog />;
    }
    else if (funcName == "viewIngredients") {
      return <NewIngredientList />;
    }
    else if (funcName == "viewVendors") {
      return <NewVendorList />;
    }
    else if (funcName == "viewStorages") {
      return <StorageList />;
    }
    else if (funcName == "NewFormula") {
      return <NewFormula />;
    }
    else if (funcName == "EditFormula") {
      return <EditFormula />;
    }
    else if (funcName == 'produceFormulas') {
      return <ProduceFormula />;
    }
    else if (funcName == 'viewFormulas') {
      return <ViewAllFormulas />;
    }
  }

  render() {
    return (
      <div className="container-fluid appcontainer">
        <NavBar />
        <div className="row row-nomargin">
          <SideBar
            link={this.link}
          />
          <div className="ContentMain col-sm-8 col-md-9 col-lg-10 col-xl-10">
            {this.renderComponent()}
          </div>
        </div>
        <div className="modal fade" id="logOutModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Log Out</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to log out?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Back</button>
                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.logout}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(HomePage);
