import React, { Component } from 'react';
import PermissionLink from './PermissionLink';

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLinkKey: '',
      activeCategoryKey: 0,
    };
    this.setActive = this.setActive.bind(this);
    this.setActiveCategory = this.setActiveCategory.bind(this);
  }

  setActive(key) {
    this.setState({
      activeLinkKey: key,
    });
  }

  setActiveCategory(key) {
    this.setState({
      activeCategoryKey: key,
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
              className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 0 ? "-Active" : "")}
              id="category0"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewIngredients');
                this.setActiveCategory(0);
                this.setActive(0);
              }}>
              Ingredient
            </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 1 ? "-Active" : "")}
              id="category1"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewVendors');
                this.setActiveCategory(1);
                this.setActive(0);
              }}>
              Vendor
            </a>
          </li>
          <li className="nav-item">
            <a
              href="javascript:void(0)"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 2 ? "-Active" : "")}
              id="category2"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewStorages');
                this.setActiveCategory(2);
                this.setActive(0);
              }}>
              Storage
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#nav-inventory"
              role="button"
              className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 3 ? "-Active" : "")}
              id="category3"
              data-toggle="collapse"
              aria-expanded="false"
              aria-controls="nav-inventory"
              data-parent="#SideBar"
              onClick={e => {
                this.props.link('viewInventory');
                this.setActiveCategory(3);
                this.setActive(0);
              }}>
              Inventory&nbsp;&nbsp;
              {global.user_group !== 'noob' && <i className="fa fa-caret-down"></i>}
            </a>
            <div className="collapse" id="nav-inventory">
              <ul className="nav flex-column">
                <PermissionLink
                  linkKey={9}
                  setActive={this.setActive}
                  activeKey={this.state.activeLinkKey}
                  action={e => {
                    this.props.link('logOrder');
                    this.setActiveCategory(3);
                  }}
                  text="Order"
                  permission="manager" />
                <PermissionLink
                  linkKey={16}
                  setActive={this.setActive}
                  activeKey={this.state.activeLinkKey}
                  action={e => {
                    this.props.link('produceFormulas');
                    this.setActiveCategory(3);
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
              className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 4 ? "-Active" : "")}
              id="category4"
              onClick={e=>{
                this.setActiveCategory(4);
                this.setActive(0);
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
                  linkKey={11}
                  setActive={this.setActive}
                  activeKey={this.state.activeLinkKey}
                  action={e => {
                    this.props.link('spendingLog');
                    this.setActiveCategory(4);
                  }}
                  text="Spending Log"
                  permission="noob" />
                <PermissionLink
                  linkKey={14}
                  setActive={this.setActive}
                  activeKey={this.state.activeLinkKey}
                  action={e => {
                    this.props.link('productionLog');
                    this.setActiveCategory(4);
                  }}
                  text="Production Log"
                  permission="noob" />
                <PermissionLink
                  linkKey={20}
                  setActive={this.setActive}
                  activeKey={this.state.activeLinkKey}
                  action={e => {
                    this.props.link('systemLog');
                    this.setActiveCategory(4);
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
                className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 5 ? "-Active" : "")}
                id="category5"
                onClick={e=>{
                  this.setActiveCategory(5);
                  this.setActive(0);
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
                    linkKey={12}
                    setActive={this.setActive}
                    activeKey={this.state.activeLinkKey}
                    action={e => {
                      this.props.link('register');
                      this.setActiveCategory(5);
                    }}
                    text="Sign Up User"
                    permission="admin" />
                  <PermissionLink
                    linkKey={13}
                    setActive={this.setActive}
                    activeKey={this.state.activeLinkKey}
                    action={e => {
                      this.props.link('changePermission');
                      this.setActiveCategory(5);
                    }}
                    text="Permission"
                    permission="admin" />
                </ul>
              </div>
            </li>
          }
          {
            global.user_group == "admin" &&
            <li className="nav-item">
              <a
                href="#nav-formula"
                role="button"
                className={"nav-link PermissionCategory" + (this.state.activeCategoryKey == 6 ? "-Active" : "")}
                id="category6"
                onClick={e=>{
                  this.setActiveCategory(6);
                  this.setActive(0);
                }}
                data-toggle="collapse"
                aria-expanded="false"
                aria-controls="nav-formula"
                data-parent="#SideBar"
              >
                Formula&nbsp;&nbsp;
            <i className="fa fa-caret-down"></i>
              </a>
              <div className="collapse" id="nav-formula">
                <ul className="nav flex-column">
                  <PermissionLink
                    linkKey={17}
                    setActive={this.setActive}
                    activeKey={this.state.activeLinkKey}
                    action={e => {
                      this.props.link('NewFormula');
                      this.setActiveCategory(6);
                    }}
                    text="New Formula"
                    permission="admin" />
                  <PermissionLink
                    linkKey={15}
                    setActive={this.setActive}
                    activeKey={this.state.activeLinkKey}
                    action={e => {
                      this.props.link('EditFormula');
                      this.setActiveCategory(6);
                    }}
                    text="Edit Existing Formula"
                    permission="admin" />
                </ul>
              </div>
            </li>
          }
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
