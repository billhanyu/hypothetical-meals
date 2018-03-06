import React, { Component } from 'react';
import PermissionLink from './PermissionLink';

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
                  linkKey={"systemLog"}
                  setActive={this.setActive}
                  activeKey={this.state.activeLink}
                  action={e => {
                    this.props.link('systemLog');
                    this.setActiveCategory("log");
                  }}
                  text="System Log"
                  permission="manager" />
              </ul>
            </div>
          </li>
          {
            global.user_group == "admin" &&
            <li className="nav-item">
              <a
                href="#nav-user"
                role="button"
                className={"nav-link PermissionCategory" + (this.state.activeCategory == "user" ? "-Active" : "")}
                id="user"
                onClick={e=>{
                  this.setActiveCategory("user");
                  this.setActive("");
                }}
                data-toggle="collapse"
                aria-expanded="false"
                aria-controls="nav-user"
                data-parent="#SideBar"
              >
                User&nbsp;&nbsp;
            <i className="fa fa-caret-down"></i>
              </a>
              <div className="collapse" id="nav-user">
                <ul className="nav flex-column">
                  <PermissionLink
                    linkKey={"register"}
                    setActive={this.setActive}
                    activeKey={this.state.activeLink}
                    action={e => {
                      this.props.link('register');
                      this.setActiveCategory("user");
                    }}
                    text="Sign Up User"
                    permission="admin" />
                  <PermissionLink
                    linkKey={"changePermission"}
                    setActive={this.setActive}
                    activeKey={this.state.activeLink}
                    action={e => {
                      this.props.link('changePermission');
                      this.setActiveCategory("user");
                    }}
                    text="Permission"
                    permission="admin" />
                </ul>
              </div>
            </li>
          }
          <li className="nav-item">
            <a
              href="#nav-formula"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategory == "formula" ? "-Active" : "")}
              id="formula"
              onClick={e=>{
                this.props.link('viewFormulas');
                this.setActiveCategory("formula");
                this.setActive("");
              }}
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-formula"
              data-parent="#SideBar"
            >
              Formula
              {
                global.user_group == "admin" &&
                <span>&nbsp;&nbsp;</span>
              }
              {
                global.user_group == "admin" &&
                <i className="fa fa-caret-down"></i>
              }
              </a>
              <div className="collapse" id="nav-formula">
                <ul className="nav flex-column">
                  <PermissionLink
                    linkKey="newFormula"
                    setActive={this.setActive}
                    activeKey={this.state.activeLink}
                    action={e => {
                      this.props.link('NewFormula');
                      this.setActiveCategory("formula");
                    }}
                    text="New Formula"
                    permission="admin" />
                  <PermissionLink
                    linkKey="editFormula"
                    setActive={this.setActive}
                    activeKey={this.state.activeLink}
                    action={e => {
                      this.props.link('EditFormula');
                      this.setActiveCategory("formula");
                    }}
                    text="Edit Existing Formula"
                    permission="admin" />
                </ul>
              </div>
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

export default SideBar;
