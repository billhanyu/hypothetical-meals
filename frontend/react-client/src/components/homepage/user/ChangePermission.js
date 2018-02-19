import React, { Component } from 'react';
import ComboBox from '../../GeneralComponents/ComboBox';
import axios from 'axios';

const PERMISSIONS = ['unprivileged', 'manager', 'admin'];

class ChangePermission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      oauth: 0,
      permission: 'unprivileged',
    };
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.checkChange = this.checkChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(field, event) {
    const newState = Object.assign({}, this.state);
    if (field == "permission" && event.target.value == "unprivileged") {
      newState[field] = "noob";
    } else {
      newState[field] = event.target.value;
    }
    this.setState(newState);
  }

  checkChange(event) {
    this.setState({
      oauth: this.state.oauth ? 0 : 1,
    });
  }

  handleSubmitButtonClick(event) {
    event.preventDefault();
    axios.post('/users/permission', {
      user: {
        username: this.state.username,
        oauth: this.state.oauth,
        permission: this.state.permission,
      }
    }, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        alert('Success!');
      })
      .catch(err => {
        alert(err.response.data);
      });
  }

  render() {
    return (
      <div>
      <h2>Change User Permission</h2>
      <div className="row justify-content-md-center">
        
        <form className="col-xl-6 col-lg-6 col-sm-8">
          <div className="form-group">
            <label htmlFor="username">Username / netID</label>
            <input type="text" className="form-control" id="username" aria-describedby="username" placeholder="username" onChange={e => this.handleInputChange('username', e)} value={this.state.username} required />
          </div>
          <div className="form-group">
            <div className="form-check">
              <input className="form-check-input" onChange={this.checkChange} type="checkbox" id="gridCheck" />
              <label className="form-check-label" htmlFor="gridCheck">
                OAuth User?
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="permission">Permission</label>
            <ComboBox className="form-control" id="permission" Options={PERMISSIONS} onChange={this.handleInputChange} selected={this.state.permission} />
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.handleSubmitButtonClick}>Submit</button>
        </form>
      </div>
      </div>
    );
  }
}

export default ChangePermission;
