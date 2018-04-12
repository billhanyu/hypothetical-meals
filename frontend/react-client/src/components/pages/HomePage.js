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
import SpendingLog from '../homepage/spendinglog/SpendingLog';
import StorageList from '../homepage/storage/StorageList';
import ProduceFormula from '../homepage/inventory/ProduceFormula.js';
import ViewAllFormulas from '../homepage/Formula/ViewAllFormulas.js';
import ProductionLog from '../homepage/productionlog/ProductionLog';
import SystemLog from '../homepage/systemlog/SystemLog';
import ProductionRun from '../homepage/productionrun/ProductionRun';
import RecallReport from '../homepage/recallreport/RecallReport';
import Freshness from '../homepage/freshnessreport/Freshness';
import FinalProductFreshness from '../homepage/finalproductfreshnessreport/FinalProductFreshness';
import UserTable from '../homepage/user/UserTable';
import ProductionLine from '../homepage/productionline/ProductionLine';
import ProfitabilityReport from '../homepage/profitabilityreport/ProfitabilityReport';

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
      return <ViewInventory />;
    }
    else if (funcName == "productionRun") {
      return <ProductionRun />;
    }
    else if (funcName == "systemLog") {
      return <SystemLog />;
    }
    else if (funcName == "logOrder") {
      return <Order />;
    }
    else if (funcName == "spendingLog") {
      return <SpendingLog />;
    }
    else if (funcName == "freshnessReport") {
      return <Freshness />;
    }
    else if (funcName == "productionLog") {
      return <ProductionLog />;
    }
    else if (funcName == "recallReport") {
      return <RecallReport />;
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
    else if (funcName == 'produceFormulas') {
      return <ProduceFormula link={this.link} />;
    }
    else if (funcName == 'viewFormulas') {
      return <ViewAllFormulas />;
    }
    else if (funcName == 'userTable') {
      return <UserTable />;
    }
    else if (funcName == 'productionline') {
      return <ProductionLine />;
    }
    else if (funcName == 'finalProductFreshnessReport'){
      return <FinalProductFreshness />;
    }
    else if (funcName == 'profitabilityReport') {
      return <ProfitabilityReport />;
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
