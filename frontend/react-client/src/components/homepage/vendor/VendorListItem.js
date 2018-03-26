import React, { Component } from 'react';

class VendorListItem extends Component {
  render() {
    const vendor = this.props.vendor;
    return (
      <tr>
        <td>{vendor.name}</td>
        <td>{vendor.code}</td>
        <td>{vendor.contact}</td>
        {
          global.user_group == 'admin' &&
          <td>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={e => this.props.edit(this.props.idx)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={e=>this.props.delete(this.props.idx)}
                data-toggle="modal"
                data-target="#deleteVendorModal"
              >
              Delete
              </button>
            </div>
          </td>
        }
      </tr>
    );
  }
}

export default VendorListItem;
