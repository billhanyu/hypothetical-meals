import React, { Component } from 'react';

class PermissionLink extends Component {
  render() {
    const linkClass = this.props.linkKey == this.props.activeKey
      ? 'PermissionLink-Active'
      : 'PermissionLink';
    const link = 
      <li className="nav-item">
        <a
          className={'nav-link active ' + linkClass}
          href="javascript:void(0)"
          onClick={e => {
            this.props.action();
            this.props.setActive(this.props.linkKey);
          }}
          Active>
          {this.props.text}
        </a>
      </li>;
    if (this.props.permission == 'noob') {
      return link;
    } else if (this.props.permission == 'manager' && global.user_group !== 'noob') {
      return link;
    } else if (this.props.permission == 'admin' && global.user_group == 'admin') {
      return link;
    } else {
      return <div></div>;
    }
  }
}

export default PermissionLink;
