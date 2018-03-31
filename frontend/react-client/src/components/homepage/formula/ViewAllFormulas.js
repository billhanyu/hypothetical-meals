import React, { Component } from 'react';
import axios from 'axios';
import BulkImport from '../ingredient/BulkImport';
import NewFormula from './NewFormula';
import FormulaListItem from './FormulaListItem';
import AddEditIngredient from '../ingredient/AddEditIngredient';
import FormulaWindow from '../formula/FormulaWindow';
import Snackbar from 'material-ui/Snackbar';

class ViewAllFormulas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formulas: [],
      addFormula: false,
      finalBulkImport: false,
      intermediateBulkImport: false,
      viewIngredient: false,
      deleting: 0,
      open: false,
      message: '',
    };
    this.backToList = this.backToList.bind(this);
    this.finalBulkImport = this.finalBulkImport.bind(this);
    this.intermediateBulkImport = this.intermediateBulkImport.bind(this);
    this.addFormula = this.addFormula.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.finishAdd = this.finishAdd.bind(this);
  }

  viewIngredient(id) {
    axios.get(`/ingredients/id/${id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          ingredient: response.data,
          viewIngredient: true,
        });
      })
      .catch(err => {
        alert('Error retrieving ingredient data');
      });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  addFormula() {
    this.setState({
      addFormula: true,
    });
  }

  edit(id) {
    this.setState({
      editing: id,
    });
  }

  delete(id) {
    this.setState({
      deleting: id,
    });
  }

  onUpdate() {
    axios.get(`/formulas`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          open: true,
          message: 'Finished Updating Formula',
          formulas: response.data,
          editing: -1,
        });
      })
      .catch(error => {
        this.setState({
          open: true,
          message: 'Error Updating Formula',
        });
      });
  }

  finishAdd() {
    axios.get(`/formulas`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          open: true,
          message: 'Finished Adding Formula',
          formulas: response.data,
          addFormula: false,
        });
      })
      .catch(error => {
        this.setState({
          open: true,
          message: 'Error Adding Formula',
        });
      });
  }

  confirmDelete() {
    axios.delete(`/formulas`, {
      headers: {
        Authorization: "Token " + global.token,
        formulaID: this.state.deleting,
      }
    }).then(response => {
      axios.get(`/formulas`, {
        headers: { Authorization: "Token " + global.token }
      })
        .then(response => {
          this.setState({
            open: true,
            message: 'Finished Deleting',
            formulas: response.data,
          });
        });
    }).catch(error => {
      this.setState({
        open: true,
        message: 'Error deleting Formula',
      });
    });
  }

  finalBulkImport() {
    this.setState({
      finalBulkImport: true,
    });
  }

  intermediateBulkImport() {
    this.setState({
      intermediateBulkImport: true,
    });
  }

  backToList() {
    this.setState({
      intermediateBulkImport: false,
      finalBulkImport: false,
      addFormula: false,
      viewIngredient: false,
      editing: -1,
    });
    this.reloadData();
  }

  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/formulas', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          formulas: response.data
        });
      });
  }

  render() {
    const finalBulkImport =
      <BulkImport endpoint='/formulas/import/final' backToList={this.backToList} />;
    const intermediateBulkImport =
      <BulkImport endpoint='/formulas/import/intermediate' backToList={this.backToList} />;
    const addFormula =
      <NewFormula onBackClick={this.backToList} onFinish={this.finishAdd} />;
    const viewIngredient =
      <AddEditIngredient mode='edit' ingredient={this.state.ingredient} backToList={this.backToList} />;
    const editFormula =
      <FormulaWindow
        isEditing
        onFinish={this.onUpdate}
        BackButtonShown
        onBackClick={this.backToList}
        newFormulaObject={this.state.formulas[this.state.editing]}
        activeId={this.state.formulas[this.state.editing] ? this.state.formulas[this.state.editing].id : 1}
      />;
    
    const columnClass = global.user_group == 'admin' ? 'OneFourthWidth' : 'OneThirdWidth';
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <h2>Formulas</h2>
        <div className='btn-group' role='group' aria-label='Basic example'>
          <button
            type='button'
            onClick={this.addFormula}
            className='btn btn-primary'
          >
            Add Formula
          </button>
          {global.user_group == 'admin' && <button type="button" className="btn btn-secondary" onClick={this.finalBulkImport}>Final Product Bulk Import</button>}
          {global.user_group == 'admin' && <button type="button" className="btn btn-dark" onClick={this.intermediateBulkImport}>Intermediate Product Bulk Import</button>}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th className={columnClass}>Name</th>
              <th className={columnClass}>Description</th>
              <th className={columnClass}>Package Amount</th>
              {
                global.user_group == 'admin' &&
                <th className={columnClass}>Options</th>
              }
            </tr>
          </thead>
            {
              this.state.formulas.map((formula, key) => {
                return (
                  <FormulaListItem
                    {...formula}
                    key={key}
                    idx={key}
                    viewIngredient={this.viewIngredient}
                    edit={this.edit}
                    delete={this.delete}
                    confirmDelete={this.confirmDelete}
                    columnClass={columnClass}
                  />
                );
              })
            }
        </table>

        <div className="modal fade" id="deleteFormulaModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this formula?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>;

    if (this.state.finalBulkImport) {
      return finalBulkImport;
    } else if (this.state.intermediateBulkImport) {
        return intermediateBulkImport;
    } else if (this.state.addFormula) {
      return addFormula;
    } else if (this.state.viewIngredient) {
      return viewIngredient;
    } else if (this.state.editing > -1) {
      return editFormula;
    } else {
      return main;
    }
  }
}

export default ViewAllFormulas;
