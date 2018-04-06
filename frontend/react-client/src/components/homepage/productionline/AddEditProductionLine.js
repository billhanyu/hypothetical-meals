import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Snackbar from 'material-ui/Snackbar';
import axios from 'axios';

class AddEditProductionLine extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    const defaultLine = {
      name: '',
      description: '',
      id: 0,
    };
    const line = props.line || defaultLine;
    this.state = {
      id: line.id,
      name: line.name,
      description: line.description,
      open: false,
      message: '',
    };
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick(event) {
    event.preventDefault();

    if (!this.state.name) {
      this.setState({
        open: true,
        message: 'Please fill out the name',
      });
      return;
    }

    const line = {
      name: this.state.name,
      description: this.state.description,
    };

    if (this.state.mode == "edit") {
      const newLine = {};
      newLine[this.state.id] = line;
      axios.put("/productionlines", {
        productionlines: newLine,
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          this.setState({
            open: true,
            message: 'Updated',
          });
        })
        .catch(error => {
          const msg = error.response.data;
          this.setState({
            open: true,
            message: msg,
          });
        });
    } else {
      axios.post("/productionlines", {
        productionlines: [line],
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          this.setState({
            id: response.data[0],
          }, () => {
            this.setState({
              open: true,
              message: "Added",
              mode: "edit",
            });
          });
        })
        .catch(error => {
          const msg = error.response.data;
          if (msg.indexOf('ER_DUP_ENTRY') > -1) {
            this.setState({
              open: true,
              message: "Name Exists",
            });
          } else {
            this.setState({
              open: true,
              message: msg,
            });
          }
        });
    }
  }

  confirmDelete() {
    axios.delete('/productionlines', {
      data: {
        ids: [this.state.id]
      },
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          open: true,
          message: "Deleted"
        });
        if (this.props.backToList) {
          this.props.backToList();
        }
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
    const header = "Production Line: " + this.state.name;
    const readOnly = global.user_group !== 'admin';
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
          style={{ color: '#FFF' }}
        />
        <h2>
          {header}
        </h2>
        <div className="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.props.backToList}>
            Back to List
          </button>
          {
            global.user_group == "admin" && this.state.mode == "edit" &&
            <button
              type="button"
              className="btn btn-danger no-collapse"
              data-toggle="modal"
              data-target="#deleteProductionlineModal">
              Delete
            </button>
          }
        </div>
        <div className="row justify-content-md-center">
          <form className="col-xl-6 col-lg-6 col-sm-8">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" className="form-control" id="name" aria-describedby="name" placeholder="Name" onChange={e => this.handleInputChange('name', e)} value={this.state.name} readOnly={readOnly} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea type="text" className="form-control" id="description" aria-describedby="unit" placeholder="Description" onChange={e => this.handleInputChange('description', e)} value={this.state.description} readOnly={readOnly} />
            </div>
            {
              !readOnly &&
              <button type="submit" className="btn btn-primary" onClick={this.handleSubmitButtonClick}>Submit</button>
            }
          </form>
        </div>

        {this.state.mode == "edit" &&
          <div>
          </div>
        }
        <div className="modal fade" id="deleteProductionlineModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this production line?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AddEditProductionLine.propTypes = {
  line: PropTypes.object,
  backToList: PropTypes.func,
  delete: PropTypes.func,
};

export default AddEditProductionLine;
