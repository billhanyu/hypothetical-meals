import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Snackbar from 'material-ui/Snackbar';
import axios from 'axios';
import AvailableFormulaSelector from '../../selector/AvailableFormulaSelector';

class AddEditProductionLine extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.changeFormulaId = this.changeFormulaId.bind(this);
    this.addFormula = this.addFormula.bind(this);
    this.removeFormula = this.removeFormula.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    const defaultLine = {
      name: '',
      description: '',
      id: 0,
      formulas: [],
    };
    const line = props.line || defaultLine;
    this.state = {
      id: line.id,
      name: line.name,
      description: line.description,
      formulas: line.formulas,
      open: false,
      message: '',
      formulaToAdd: '',
      mode: props.mode,
    };
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  changeFormulaId(newValue) {
    this.setState({
      formulaToAdd: newValue,
    });
  }

  reloadData() {
    axios.get(`/productionlines/id/${this.state.id}`, {
      headers: {Authorization: 'Token ' + global.token},
    })
      .then(response => {
        const line = response.data[0];
        this.setState({
          name: line.name,
          description: line.description,
          formulas: line.formulas,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error reloading for this production line',
        });
      });
  }

  addFormula(e) {
    e.preventDefault();
    if (!this.state.formulaToAdd) {
      this.setState({
        open: true,
        message: 'Please select a formula to add',
      });
      return;
    }
    axios.post('/formulaproductionlines', {
      lineid: this.state.id,
      formulaid: this.state.formulaToAdd,
    }, {
      headers: {Authorization: 'Token ' + global.token},
    })
      .then(response => {
        this.setState({
          open: true,
          message: 'Formula added to this line',
        });
        this.reloadData();
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error adding formula',
        });
      });
  }

  removeFormula(id) {
    axios.delete('/formulaproductionlines', {
        data: {
          lineid: this.state.id,
          formulaid: id,
        },
        headers: { Authorization: 'Token ' + global.token },
      })
      .then(response => {
        this.setState({
          open: true,
          message: 'Formula removed',
        });
        this.reloadData();
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error removing formula',
        });
      });
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
      formulas: [],
    };

    if (this.state.mode == "edit") {
      line.id = this.state.id,
      axios.put("/productionlines", {
        lines: [line],
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
        lines: [line],
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
        lines: [this.state.id]
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
    const columnClass = 'HalfWidth';
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

        {this.state.mode == 'edit' &&
          <div style={{'margin-top': '40px'}}>
            <h4>Formulas that this production line produces</h4>
            {
              global.user_group !== 'noob' &&
              <div className="row justify-content-md-center">
                <form className="col-xl-6 col-lg-6 col-sm-8">
                  <div className='row'>
                    <div className="col-md-10">
                      <AvailableFormulaSelector changeFormulaId={this.changeFormulaId} existing={this.state.formulas} />
                    </div>
                    <button type="submit" className="btn btn-primary col-md-2" onClick={this.addFormula}>Add</button>
                  </div>
                </form>
              </div>
            }
            <div className="row justify-content-md-center" style={{'margin-top': '30px'}}>
              <table className='table col-xl-6 col-lg-6 col-sm-8'>
                <thead>
                  <tr>
                    <th className={columnClass}>Name</th>
                    {
                      global.user_group !== 'noob' &&
                      <th className={columnClass}>Options</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.formulas.map((formula, idx) => {
                      return (
                        <tr key={idx}>
                          <td className={columnClass}>{formula.name}</td>
                          {
                            global.user_group !== 'noob' &&
                            <td
                              className={columnClass}
                              onClick={e=>this.removeFormula(formula.formula_id)}
                              style={{cursor: 'pointer'}}>
                              <i className="fas fa-trash"></i>
                            </td>
                          }
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
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
  mode: PropTypes.string,
};

export default AddEditProductionLine;
