import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';
import VendorListItem from './VendorListItem';
import AddEditVendor from './AddEditVendor';
import Snackbar from 'material-ui/Snackbar';

class VendorList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendors: [],
      pages: 1,
      page: 1,
      toDelete: 0,
      adding: false,
      editing: false,
      editingIdx: -1,
    };
    this.selectPage = this.selectPage.bind(this);
    this.delete = this.delete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.add = this.add.bind(this);
    this.finishAdd = this.finishAdd.bind(this);
    this.edit = this.edit.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
    this.backToList = this.backToList.bind(this);
  }

  componentDidMount() {
    this.getPageNum();
    this.selectPage(1);
  }

  backToList() {
    this.setState({
      adding: false,
      editing: false,
    });
  }

  add() {
    this.setState({
      adding: true,
    });
  }

  finishAdd() {
    this.setState({
      adding: false,
    });
    this.selectPage(this.state.page);
  }

  edit(idx) {
    this.setState({
      editing: true,
      editingIdx: idx,
    });
  }

  finishEdit() {
    this.setState({
      editing: false,
    });
    this.selectPage(this.state.page);
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
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data
        });
      });
  }

  selectPage(page) {
    this.setState({
      page,
    });
    axios.get(`/vendors/page/${page}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const vendors = response.data.filter(vendor => {
          return vendor.removed.data[0] == 0 && vendor.id != 1;
        });
        this.setState({
          vendors,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data
        });
      });
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
      this.setState({
        open: true,
        message: "Deleted"
      });
    })
    .catch(err => {
      this.setState({
        open: true,
        message: err.response.data
      });
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <h2>Vendors</h2>
        {global.user_group == "admin" && <button type="button" className="btn btn-primary" onClick={this.add}>Add Vendor</button>}
        <table className="table">
          <thead>
            <tr>
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
                  <VendorListItem key={idx} idx={idx} edit={this.edit} delete={this.delete} vendor={vendor} />
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
        <PageBar pages={this.state.pages} selectPage={this.selectPage} currentPage={this.state.page} />
      </div>;

    const edit =
    <AddEditVendor mode="edit" backToList={this.backToList} vendor={this.state.vendors[this.state.editingIdx]} finishEdit={this.finishEdit} />;

    const add =
    <AddEditVendor mode="add" backToList={this.backToList} finishAdd={this.finishAdd} />;

    if (this.state.editing) {
      return edit;
    } else if (this.state.adding) {
      return add;
    } else {
      return main;
    }
  }
}

export default VendorList;
