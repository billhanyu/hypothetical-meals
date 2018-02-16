import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';

class VendorList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendors: [],
      pages: 1,
    };
    this.selectPage = this.selectPage.bind(this);
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
      .catch(err => console.error(err));
  }

  selectPage(page) {
    axios.get(`/vendors/page/${page}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          vendors: response.data,
        });
      })
      .catch(err => console.error(err));
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
            </tr>
          </thead>
          <tbody>
            {
              this.state.vendors.map((vendor, idx) => {
                return (
                  <tr key={idx}>
                    <td>{vendor.id}</td>
                    <td>{vendor.name}</td>
                    <td>{vendor.code}</td>
                    <td>{vendor.contact}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <PageBar pages={this.state.pages} selectPage={this.selectPage} />
      </div>
    );
  }
}

export default VendorList;
