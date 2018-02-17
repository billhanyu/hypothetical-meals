import React, { Component } from 'react';
import PermissionLink from './PermissionLink';

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLinkKey: '',
    };
    this.setActive = this.setActive.bind(this);
  }

  setActive(key) {
    this.setState({
      activeLinkKey: key,
    });
  }

  render() {
    return (
      <div className="SideBar col-sm-4 col-md-3 col-lg-2 col-xl-2" id="SideBar">
        <ul className="nav flex-column">
          <li className="nav-item">
            <a
              href="#nav-ingredient"
              role="button"
              className="nav-link PermissionCategory"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-ingredient"
              data-parent="#SideBar"
              onClick={e => this.props.link('viewIngredients')}>
              Ingredient&nbsp;&nbsp;
              {global.user_group !== 'noob' && <i className="fa fa-caret-down"></i>}
            </a>
            <div className="collapse" id="nav-ingredient">
              <ul className="nav flex-column">
                <PermissionLink linkKey={2} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('addVendorIngredient')} text="Add Vendor for Ingredient" permission="admin" />
                <PermissionLink linkKey={3} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('editVendorIngredient')} text="Edit Vendor for Ingredient" permission="admin" />
                <PermissionLink linkKey={4} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('bulkImport')} text="Bulk Import" permission="admin" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className="nav-link PermissionCategory"
              data-parent="#SideBar"
              onClick={e => this.props.link('viewVendors')}>
              Vendor
            </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className="nav-link PermissionCategory"
              data-parent="#SideBar"
              onClick={e => this.props.link('viewStorages')}>
              Storage
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#nav-inventory"
              role="button"
              className="nav-link PermissionCategory"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-inventory"
              data-parent="#SideBar"
              onClick={e => this.props.link('viewInventory')}>
              Inventory&nbsp;&nbsp;
              {global.user_group !== 'noob' && <i className="fa fa-caret-down"></i>}
            </a>
            <div className="collapse" id="nav-inventory">
              <ul className="nav flex-column">
                <PermissionLink linkKey={8} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('inventoryQuantity')} text="Change Inventory Quantity" permission="admin" />
                <PermissionLink linkKey={9} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('logOrder')} text="Order" permission="manager" />
                <PermissionLink linkKey={10} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('checkOut')} text="Check Out" permission="manager" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="#nav-log"
              role="button"
              className="nav-link PermissionCategory"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-log"
              data-parent="#SideBar"
            >
              Log&nbsp;&nbsp;
            <i className="fa fa-caret-down"></i>
            </a>
            <div className="collapse" id="nav-log">
              <ul className="nav flex-column">
                <PermissionLink linkKey={11} setActive={this.setActive} activeKey={this.state.activeLinkKey} action={e => this.props.link('spendingLog')} text="Spending Log" permission="noob" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              className="nav-link active PermissionCategory"
              href="javascript:void(0)"
              onClick={this.props.logout}
              Active>
              Log Out
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default SideBar;
