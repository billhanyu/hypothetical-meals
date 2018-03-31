import React, { Component } from 'react';

class UserTableRow extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
      1. name (String)
      2. username (string)
      3. user_group (String)
      4. oauth (JSON object)
      5. onDelete (Func)
      6. changePermission (FuncO)
  ****/
  handleOpen(){
    this.setState({open: true});
  }

  handleClose(){
    this.setState({open: false});
  }

  _capitalize(string) {
    const niceGroup = string == 'noob' ? 'unprivileged' : string;
    return niceGroup.charAt(0).toUpperCase() + niceGroup.slice(1).toLowerCase();
  }

  render() {
    const isOAuth = this.props.oauth === 1;
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.props.username}</td>
        <td style={{ cursor: 'pointer' }} onClick={() => { this.props.changePermission(this.props.username, this.props.user_group, this.props.oauth)}}><i className="far fa-edit"></i> {this._capitalize(this.props.user_group)}</td>
        <td style={{color: isOAuth ? "green" : "red"}}>{isOAuth ? "YES" : "NO"}</td>
        <td>
          <button
            type='button'
            onClick={e=>this.props.onDelete(this.props.username)}
            data-toggle="modal"
            data-target="#deleteUserModal">
            <i className="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    );
  }
}

export default UserTableRow;
