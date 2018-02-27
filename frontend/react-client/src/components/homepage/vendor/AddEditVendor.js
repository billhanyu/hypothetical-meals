import React, { Component } from 'react';
import axios from 'axios';

class EditVendor extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    if (props.mode == 'edit') {
      this.state = {
        name: props.vendor.name,
        contact: props.vendor.contact,
        removed: props.vendor.removed.data[0],
        code: props.vendor.code,
        id: props.vendor.id,
      };
    } else {
      this.state = {
        name: '',
        contact: '',
        code: '',
      };
    }
  }

  /*** REQUIRED PROPS
    1. name (String)
    2. id (Number)
    3. contact (String)
    4. code (String)
  */

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick(e) {
    e.preventDefault();
    const self = this;
    if (!this.state.name || !this.state.code || !this.state.contact) {
      alert('Please fill in all of the fields');
      return;
    }
    if (this.props.mode == "edit") {
      const newVendorObject = {};
      newVendorObject[this.state.id] = {
        name: this.state.name,
        contact: this.state.contact,
        code: this.state.code,
      };

      axios.put("/vendors", {
        vendors: newVendorObject,
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(function (response) {
          self.setState({
            hasUpdated: true,
            errorMessage: null,
          });
          self.props.finishEdit();
        })
        .catch(error => {
          self.setState({
            errorMessage: error.response.data
          });
          alert(error.response.data);
        });
    } else {
      axios.post("/vendors", {
        vendors: [{
          name: this.state.name,
          contact: this.state.contact,
          code: this.state.code,
        }]
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          self.props.finishAdd();
        })
        .catch(error => {
          alert(error.response.data);
        });
    }
  }

  render() {
    const readOnly = (global.user_group !== "admin") || (this.state.removed);
    return (
      <div>
        <h2>
          {'Vendor: ' + this.state.name}
          {
            this.state.removed == 1 &&
            <span style={{ 'margin-left': '20px' }} className="badge badge-danger">Deleted</span>
          }
        </h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.props.backToList}>
          Back to List
        </button>
        <div className="row justify-content-md-center">
          <form className="col-xl-6 col-lg-6 col-sm-8">
            <div className="form-group">
              <label htmlFor="name">Vendor Name</label>
              <input type="text" className="form-control" id="name" aria-describedby="name" placeholder="Name" onChange={e => this.handleInputChange('name', e)} value={this.state.name} readOnly={readOnly} />
            </div>
            <div className="form-group">
              <label htmlFor="code">Unique Code</label>
              <input type="text" className="form-control" id="code" aria-describedby="code" placeholder="Code" onChange={e => this.handleInputChange('code', e)} value={this.state.code} readOnly={readOnly} />
            </div>
            <div className="form-group">
              <label htmlFor="contact">Contact Info</label>
              <input type="text" className="form-control" id="contact" aria-describedby="contact" placeholder="Contact" onChange={e => this.handleInputChange('contact', e)} value={this.state.contact} readOnly={readOnly} />
            </div>
            {
              !readOnly &&
              <button type="submit" className="btn btn-primary" onClick={this.handleSubmitButtonClick}>Submit</button>
            }
          </form>
        </div>
      </div>
    );
  }
}

export default EditVendor;
