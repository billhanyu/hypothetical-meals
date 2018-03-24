import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class UserTableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
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
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  render() {
    const isOAuth = this.props.oauth.data[0] === 1;
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        key={0}
        onClick={this.handleClose.bind(this)}
      />,
      <FlatButton
        label="Confirm"
        primary={true}
        key={1}
        onClick={() => {this.props.onDelete(this.props.username);}}
      />,
    ];
    return (
      <tr>
        <Dialog
          title="Confirm delete"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
          Are you sure you want to delete this user?
        </Dialog>
        <td>{this.props.name}</td>
        <td>{this.props.username}</td>
        <td style={{cursor: 'pointer'}} onClick={() => {this.props.changePermission(this.props.username)}}><i className="far fa-edit"></i> {this._capitalize(this.props.user_group)}</td>
        <td style={{color: isOAuth ? "green" : "red"}}>{isOAuth ? "YES" : "NO"}</td>
        <td style={{cursor: 'pointer'}} onClick={this.handleOpen.bind(this)}><i className="fas fa-trash"></i></td>
      </tr>
    );
  }
}

export default UserTableRow;
