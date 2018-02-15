import React, { Component } from 'react';
import PermissionLink from './PermissionLink';

class SideBar extends Component {
  render() {
    return (
      <div className="SideBar col-sm-4 col-md-3 col-lg-2 col-xl-2" id="SideBar">
        <ul className="nav flex-column">
          <li className="nav-item">
            <a
              href="#nav-ingredient"
              role="button"
              className="nav-link"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-ingredient"
              data-parent="#SideBar"
              onClick={this.props.viewIngredients}>
              Ingredient
            <i className="fa fa-caret-down"></i>
            </a>
            <div className="collapse" id="nav-ingredient">
              <ul className="nav flex-column">
                <PermissionLink action={e => this.props.link('addIngredient')} text="Add Ingredient" permission="admin" />
                <PermissionLink action={e => this.props.link('editIngredient')} text="Edit Ingredient" permission="admin" />
                <PermissionLink action={e => this.props.link('addVendorIngredient')} text="Add Vendor for Ingredient" permission="admin" />
                <PermissionLink action={e => this.props.link('editVendorIngredient')} text="Edit Vendor for Ingredient" permission="admin" />
                <PermissionLink action={e => this.props.link('bulkImport')} text="Bulk Import" permission="admin" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="#nav-vendor"
              role="button"
              className="nav-link"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-vendor"
              data-parent="#SideBar"
              onClick={this.props.viewVendors}>
              Vendor
            <i className="fa fa-caret-down"></i>
            </a>
            <div className="collapse" id="nav-vendor">
              <ul className="nav flex-column">
                <PermissionLink action={e => this.props.link('addVendor')} text="Add Vendor" permission="admin" />
                <PermissionLink action={e => this.props.link('editVendor')} text="Edit Vendor" permission="admin" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="#nav-storage"
              role="button"
              className="nav-link"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-storage"
              data-parent="#SideBar"
              onClick={this.props.viewStorages}>
              Storage
            <i className="fa fa-caret-down"></i>
            </a>
            <div className="collapse" id="nav-storage">
              <ul className="nav flex-column">
                <PermissionLink action={e => this.props.link('editStorage')} text="Edit Storage" permission="admin" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="#nav-inventory"
              role="button"
              className="nav-link"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-inventory"
              data-parent="#SideBar"
              onClick={e => this.props.link('viewInventory')}>
              Inventory
            <i className="fa fa-caret-down"></i>
            </a>
            <div className="collapse" id="nav-inventory">
              <ul className="nav flex-column">
                <PermissionLink action={e => this.props.link('inventoryQuantity')} text="Change Inventory Quantity" permission="admin" />
                <PermissionLink action={e => this.props.link('logOrder')} text="Order" permission="manager" />
                <PermissionLink action={e => this.props.link('checkOut')} text="Check Out" permission="manager" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="#nav-log"
              role="button"
              className="nav-link"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-log"
              data-parent="#SideBar"
            >
              Log
            <i className="fa fa-caret-down"></i>
            </a>
            <div className="collapse" id="nav-log">
              <ul className="nav flex-column">
                <PermissionLink action={e => this.props.link('spendingLog')} text="Spending Log" permission="noob" />
              </ul>
            </div>
          </li>
          <PermissionLink action={this.props.logout} text="Log Out" permission="noob" />
        </ul>
      </div>
    );
  }
}

export default SideBar;
