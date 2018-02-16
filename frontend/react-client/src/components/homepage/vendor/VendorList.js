import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';
import VendorListItem from './VendorListItem';

class VendorList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendors: [],
      pages: 1,
      toDelete: 0,
    };
    this.selectPage = this.selectPage.bind(this);
    this.delete = this.delete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
  }

  componentDidMount() {
    this.getPageNum();
    this.selectPage(1);
  }

  getPageNum() {
    axios.get('/vendors/pages', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          pages: response.data.numPages,
        });
      })
      .catch(err => alert('Some error occurred'));
  }

  selectPage(page) {
    axios.get(`/vendors/page/${page}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const vendors = response.data.filter(vendor => {
          return vendor.removed.data[0] == 0;
        });
        this.setState({
          vendors,
        });
      })
      .catch(err => alert('Some error occurred'));
  }

  delete(idx) {
    this.setState({
      toDelete: idx,
    });
  }

  confirmDelete() {
    axios.delete('/vendors', {
      data: {
        ids: [this.state.vendors[this.state.toDelete].id]
      },
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.selectPage(1);
    })
    .catch(err => alert('Some error occurred'));
  }

  render() {
    return (
      <div>
        <h2>Vendors</h2>
        <table className="table">
          <thead>
            <tr>
              <th>id</th>
              <th>Name</th>
              <th>Code</th>
              <th>Contact</th>
              {
                global.user_group == 'admin' &&
                <th>
                  Options
                </th>
              }
            </tr>
          </thead>
          <tbody>
            {
              this.state.vendors.map((vendor, idx) => {
                return (
                  <VendorListItem key={idx} idx={idx} delete={this.delete} vendor={vendor} />
                );
              })
            }
          </tbody>
        </table>
        <div className="modal fade" id="deleteVendorModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this vendor?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
        <PageBar pages={this.state.pages} selectPage={this.selectPage} />
      </div>
    );
  }
}

export default VendorList;
