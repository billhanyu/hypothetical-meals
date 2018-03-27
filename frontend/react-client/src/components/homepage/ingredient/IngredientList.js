import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';
import IngredientListItem from './IngredientListItem';
import AddEditIngredient from './AddEditIngredient';
import BulkImport from './BulkImport';
import PropTypes from 'prop-types';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import Snackbar from 'material-ui/Snackbar';

class IngredientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [], // paged
      pages: 1,
      page: 1,
      toDelete: 0,
      storages: [],
      editing: false,
      adding: false,
      viewingIdx: -1,
      bulkImport: false,
      editingIdx: 0,
    };
    this.allIngredients = []; // all
    this.selectPage = this.selectPage.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
    this.add = this.add.bind(this);
    this.finishAdd = this.finishAdd.bind(this);
    this.bulkImport = this.bulkImport.bind(this);
    this.backToList = this.backToList.bind(this);
    this.orderIngredient = this.orderIngredient.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.reloadData = this.reloadData.bind(this);
  }

  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/ingredients', {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      const ingredients = response.data;
      ingredients.sort((a, b) => a.id - b.id);
      const filtered = ingredients.filter(ingredient => {
        return !(this.props.order && ingredient.intermediate)
          && !ingredient.removed;
      });
      this.allIngredients = filtered;
      this.selectPage(1);
      this.setState({
        pages: Math.ceil(filtered.length / COUNT_PER_PAGE),
      });
    })
    .catch(err => {
      this.setState({
        open: true,
        message: 'Data Retrieval Error',
      });
    });
  }

  selectPage(idx) {
    const ingredients = [];
    for (let i = (idx - 1) * COUNT_PER_PAGE; i < idx * COUNT_PER_PAGE && i < this.allIngredients.length; i++) {
      ingredients.push(this.allIngredients[i]);
    }
    this.setState({
      editing: false,
      ingredients,
      page: idx,
    });
  }

  bulkImport() {
    this.setState({
      bulkImport: true,
    });
  }

  backToList() {
    this.setState({
      bulkImport: false,
      adding: false,
      editing: false,
      viewingIdx: -1,
    });
    this.selectPage(this.state.page);
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

  delete(idx) {
    this.setState({
      toDelete: idx,
    });
  }

  confirmDelete() {
    axios.delete('/ingredients', {
      data: {
        ingredients: [this.state.ingredients[this.state.toDelete].id]
      },
      headers: {
        Authorization: "Token " + global.token
      }
    })
    .then(response => {
      this.setState({
        open: true,
        message: 'Deleted!',
      });
      this.reloadData();
    })
    .catch(err => {
      this.setState({
        open: true,
        message: err.response.data,
      });
    });
  }

  orderIngredient(idx, quantity) {
    this.props.orderIngredient(this.state.ingredients[idx], quantity);
  }

  viewIngredient(idx) {
    this.setState({
      viewingIdx: idx,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  _rerenderIngredientList() {
    axios.get('/ingredients', {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      const ingredients = response.data;
      ingredients.sort((a, b) => a.id - b.id);
      const filtered = [];
      ingredients.forEach(ingredient => {
        if (!(this.props.order && ingredient.intermediate)) {
          filtered.push(ingredient);
        }
      });
      this.allIngredients = filtered;
      this.selectPage(1);
      this.setState({
        pages: Math.ceil(filtered.length / COUNT_PER_PAGE),
      });
    })
    .catch(err => {
      this.setState({
        open: true,
        message: 'Data Retrieval Error',
      });
    });
  }

  render() {
    const ifNeedsRerenderBecauseOfAddedIngredient = global.AddEditIngredientNeedsRerender === true;
    if (ifNeedsRerenderBecauseOfAddedIngredient) {
      global.AddEditIngredientNeedsRerender = false;
      this.reloadData();
    }
    const edit =
    <AddEditIngredient
      mode="edit"
      ingredient={this.state.ingredients[this.state.editingIdx]}
      backToList={this.backToList}
      finishEdit={this.finishEdit}
      reloadData={this.reloadData}
    />;

    const view =
      <AddEditIngredient
        mode="edit"
        ingredient={this.state.ingredients[this.state.viewingIdx]}
        backToList={this.backToList}
        reloadData={this.reloadData}
      />;

    const bulkImport =
    <BulkImport endpoint='/ingredients/import' backToList={this.backToList} />;

    const columnClass = this.props.order || global.user_group == 'admin' ? 'OneFifthWidth' : 'OneFourthWidth';

    const main =
    <div>
      <Snackbar
        open={this.state.open}
        message={this.state.message}
        autoHideDuration={2500}
        onRequestClose={this.handleRequestClose.bind(this)}
      />
      {!this.props.order &&
      <div>
      <h2>Ingredients</h2>
      {global.user_group == 'admin' && <button type="button" className="btn btn-primary" onClick={this.add}>Add Ingredient</button>}
      {global.user_group == 'admin' && <button type="button" className="btn btn-primary" onClick={this.bulkImport}>Bulk Import</button>}
      </div>
      }
      <table className="table">
        <thead>
          <tr>
            <th className={columnClass}>Name</th>
            <th className={columnClass}>Package Type</th>
            <th className={columnClass}>Storage</th>
            <th className={columnClass}>Size</th>
            {
              global.user_group == 'admin' && !this.props.order &&
              <th className={columnClass}>Options</th>
            }
            {
              this.props.order &&
              <th className={columnClass}>Order</th>
            }
          </tr>
        </thead>
        {
          this.state.ingredients.map((ingredient, idx) => {
            return (
              <IngredientListItem
                key={idx}
                idx={idx}
                onClick={this.props.onClickIngredient}
                columnClass={columnClass}
                order={this.props.order}
                orderIngredient={this.orderIngredient}
                viewIngredient={this.viewIngredient}
                edit={this.edit}
                delete={this.delete}
                ingredient={ingredient}
              />
            );
          })
        }
      </table>
      <div className="modal fade" id="deleteIngredientModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this ingredient?
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

    const add =
    <AddEditIngredient
      mode="add"
      backToList={this.backToList}
      finishAdd={this.finishAdd}
      reloadData={this.reloadData}
    />;

    if (this.state.editing) {
      return edit;
    } else if (this.state.viewingIdx > -1) {
      return view;
    } else if (this.state.bulkImport) {
      return bulkImport;
    } else if (this.state.adding) {
      return add;
    } else {
      return main;
    }
  }
}

IngredientList.propTypes = {
  orderIngredient: PropTypes.func,
  onClickIngredient: PropTypes.func,
  order: PropTypes.bool,
};

export default IngredientList;
