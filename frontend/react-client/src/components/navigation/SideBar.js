import React, { Component } from 'react';
import PermissionLink from './PermissionLink';
import PropTypes from 'prop-types';

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLink: '',
      activeCategory: "ingredient",
    };
    this.setActive = this.setActive.bind(this);
    this.setActiveCategory = this.setActiveCategory.bind(this);
  }

  setActive(key) {
    this.setState({
      activeLink: key,
    });
  }

  setActiveCategory(key) {
    this.setState({
      activeCategory: key,
    });
  }

  render() {
    return (
      <div className="SideBar col-sm-4 col-md-3 col-lg-2 col-xl-2" id="SideBar">
        <ul className="nav flex-column">
          <li className="nav-item UserName">
            Hi {global.user_username}
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "ingredient" ? "-Active" : "")}
              id="ingredient"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewIngredients');
                this.setActiveCategory("ingredient");
                this.setActive("");
              }}>
              Ingredient
            </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "vendor" ? "-Active" : "")}
              id="vendor"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewVendors');
                this.setActiveCategory("vendor");
                this.setActive("");
              }}>
              Vendor
            </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "formula" ? "-Active" : "")}
              id="formula"
              onClick={e => {
                this.props.link('viewFormulas');
                this.setActiveCategory("formula");
                this.setActive("");
              }}
              data-parent="#SideBar"
            >
              Formula
            </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "storage" ? "-Active" : "")}
              id="storage"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewStorages');
                this.setActiveCategory("storage");
                this.setActive("");
              }}>
              Storage
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#nav-inventory"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "inventory" ? "-Active" : "")}
              id="inventory"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-inventory"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewInventory');
                this.setActiveCategory("inventory");
                this.setActive("");
              }}>
              Inventory&nbsp;&nbsp;
              {global.user_group !== 'noob' && <i className="fa fa-caret-down"></i>}
            </a>
            <div className="collapse" id="nav-inventory">
              <ul className="nav flex-column">
                <PermissionLink
                  linkKey={"logOrder"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('logOrder');
                    this.setActiveCategory("inventory");
                  }}
                  text="Order"
                  permission="manager" />
                <PermissionLink
                  linkKey={"produceFormula"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('produceFormulas');
                    this.setActiveCategory("inventory");
                  }}
                  text="Produce Formulas"
                  permission="manager" />
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              href="#nav-log"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "log" ? "-Active" : "")}
              id="log"
              onClick={e=>{
                this.setActiveCategory("log");
                this.setActive("");
              }}
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
                <PermissionLink
                  linkKey={"spendingLog"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('spendingLog');
                    this.setActiveCategory("log");
                  }}
                  text="Spending Log"
                  permission="noob" />
                <PermissionLink
                  linkKey={"productionLog"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('productionLog');
                    this.setActiveCategory("log");
                  }}
                  text="Production Log"
                  permission="noob" />
                <PermissionLink
                  linkKey={"productionRun"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link("productionRun");
                    this.setActiveCategory("log");
                  }}
                  text="Production Runs"
                  permission="noob" />
                <PermissionLink
                  linkKey={"systemLog"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('systemLog');
                    this.setActiveCategory("log");
                  }}
                  text="System Log"
                  permission="manager" />
                <PermissionLink
                  linkKey={"recallReport"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('recallReport');
                    this.setActiveCategory("log");
                  }}
                  text="Recall Report"
                  permission="noob" />
                <PermissionLink
                  linkKey={"freshnessReport"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('freshnessReport');
                    this.setActiveCategory("log");
                  }}
                  text="Freshness Report"
                  permission="noob" />
              </ul>
            </div>
          </li>
          {
            global.user_group == "admin" &&
            <li className="nav-item">
              <a
                href="javascript:void(0)"
                role="button"
                className={"nav-link PermissionCategory" + (this.state.activeCategory == "user" ? "-Active" : "")}
                id="user"
                onClick={e=>{
                  this.setActiveCategory("user");
                  this.props.link('userTable');
                  this.setActive("");
                }}
                data-parent="#SideBar"
              >
                User
              </a>
            </li>
          }
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "productionline" ? "-Active" : "")}
              id="user"
              onClick={e => {
                this.setActiveCategory("productionline");
                this.props.link('productionline');
                this.setActive("");
              }}
              data-parent="#SideBar"
            >
              Production Line
              </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "productinventory" ? "-Active" : "")}
              id="user"
              onClick={e => {
                this.setActiveCategory("productinventory");
                this.props.link('productinventory');
                this.setActive("");
              }}
              data-parent="#SideBar"
            >
              Product Inventory
              </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link active PermissionCategory"
              href="javascript:void(0)"
              data-toggle="modal"
              data-target="#logOutModal"
              Active>
              Log Out
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

SideBar.propTypes = {
  link: PropTypes.func,
};

export default SideBar;
