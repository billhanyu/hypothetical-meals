import React, { Component } from 'react';
import axios from 'axios';
import UserTableRow from './UserTableRow';
import ChangePermission from './ChangePermission';
import Snackbar from 'material-ui/Snackbar';

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      users: [],
      changingPermission: false,
    };
  }

  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/users', {headers: {Authorization: "Token " + global.token}})
    .then(response => {
      this.setState({
        isLoading: false,
        users: response.data
      });
    })
    .catch(errors => {
      this.setState({
        open: true,
        message: errors.response.data
      });
    });
  }

  _changePermission(username, userGroup, oauth) {
    this.setState({
      changingPermission: true,
      activeUsername: username,
      activeUsergroup: userGroup,
      activeOauth: oauth,
    });
  }

  _handleDelete(username) {
    axios.post('/users/delete',
    {
      user: { username, }
    },
    {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      axios.get('/users', {headers: {Authorization: "Token " + global.token}})
      .then(response => {
        this.setState({
          users: response.data,
          open: true,
          message: 'Deleted User',
        });
      });
    })
    .catch(error => {
      this.setState({
        open: true,
        message: error.response.data
      });
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  _handleCancel() {
    this.setState({
      changingPermission: false,
    });
  }

  render() {
    if(this.state.isLoading) return false;
    const livingUsers = this.state.users.filter(element => {
      return element.removed.data[0] === 0;
    });
    return (
      this.state.changingPermission ?
        <ChangePermission
          cancel={this._handleCancel.bind(this)}
          reloadData={this.reloadData.bind(this)}
          username={this.state.activeUsername}
          usergroup={this.state.activeUsergroup}
          oauth={this.state.activeOauth}
        />
      :
    <div>
      <Snackbar
        open={this.state.open}
        message={this.state.message}
        autoHideDuration={2500}
        onRequestClose={this.handleRequestClose.bind(this)}
      />
      <h2>Users</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>User Group</th>
            <th>OAuth</th>
          </tr>
        </thead>
        <tbody>
          {
            livingUsers.map((element, key) => {
              return (
                <UserTableRow
                  changePermission={this._changePermission.bind(this)}
                  onDelete={this._handleDelete.bind(this)}
                  reloadData={this.reloadData.bind(this)}
                  key={key}
                  {...element}
                />
              );
            })
        }
        </tbody>
      </table>
    </div>);
  }
}

export default UserTable;
