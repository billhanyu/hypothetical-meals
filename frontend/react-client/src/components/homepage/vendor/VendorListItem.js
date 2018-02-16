import React, { Component } from 'react';

class VendorListItem extends Component {
  render() {
    const vendor = this.props.vendor;
    return (
      <tr>
        <td>{vendor.id}</td>
        <td>{vendor.name}</td>
        <td>{vendor.code}</td>
        <td>{vendor.contact}</td>
        {
          global.user_group == 'admin' &&
          <td>
            <button
              type="button"
              className="btn btn-danger"
              onClick={e=>this.props.delete(this.props.idx)}
              data-toggle="modal"
              data-target="#deleteVendorModal"
            >
            Delete
            </button>
          </td>
        }
      </tr>
    );
  }
}

export default VendorListItem;
