import React, { Component } from 'react';
import ComboBox from '../../GeneralComponents/ComboBox';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';

const PERMISSIONS = ['unprivileged', 'manager', 'admin'];

class ChangePermission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oauth: 0,
      permission: 'unprivileged',
    };
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.checkChange = this.checkChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /*** REQUIRED PROPS
    1. username (String)
    2. cancel (Func)
  **/

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
        username: this.props.username,
        oauth: this.state.oauth,
        permission: this.state.permission,
      }
    }, {
        headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          open: true,
          message: "Changed Permission",
        });
        this.props.cancel();
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data,
        });
      });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div>
      <Snackbar
        open={this.state.open}
        message={this.state.message}
        autoHideDuration={2500}
        onRequestClose={this.handleRequestClose.bind(this)}
      />
      <h2>Change User Permission</h2>
      <div className="row justify-content-md-center">

        <form className="col-xl-6 col-lg-6 col-sm-8">
          <div className="form-group">
            <label htmlFor="username">Username / netID</label>
            <input disabled type="text" className="form-control" id="username" aria-describedby="username" placeholder="Username" value={this.props.username} required />
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
          <button style={{marginLeft:'8px'}} className="btn btn-primary" onClick={this.props.cancel}>Cancel</button>
        </form>
      </div>
      </div>
    );
  }
}

export default ChangePermission;
