import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';
import IngredientListItem from './IngredientListItem';
import AddEditIngredient from './AddEditIngredient';
import BulkImport from './BulkImport';

class IngredientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [],
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
  }

  componentDidMount() {
    this.getPageNum();
    this.selectPage(1);
  }

  getPageNum() {
    axios.get('/ingredients/pages', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          pages: response.data.numPages,
        });
      })
      .catch(err => alert('Retrieving data error'));
  }

  selectPage(page) {
    this.setState({
      editing: false,
      page,
    });
    axios.get(`/ingredients/page/${page}`, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      const ingredients = response.data;
      ingredients.sort((a, b) => a.id - b.id);
      this.setState({
        ingredients,
      });
    })
    .catch(err => alert('Retrieving data error'));
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
      this.selectPage(1);
      alert('Deleted!');
    })
    .catch(err => {
      alert(err.response.data);
    });
  }

  orderIngredient(idx) {
    this.props.orderIngredient(this.state.ingredients[idx]);
  }

  viewIngredient(idx) {
    this.setState({
      viewingIdx: idx,
    });
  }

  render() {
    const edit =
    <AddEditIngredient
      mode="edit"
      ingredient={this.state.ingredients[this.state.editingIdx]}
      backToList={this.backToList}
      finishEdit={this.finishEdit}
    />;

    const view =
      <AddEditIngredient
        mode="edit"
        ingredient={this.state.ingredients[this.state.viewingIdx]}
        backToList={this.backToList}
      />;

    const bulkImport =
    <BulkImport endpoint='/ingredients/import' backToList={this.backToList} />;

    const main =
    <div>
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
            <th>id</th>
            <th>Name</th>
            <th>Package Type</th>
            <th>Storage</th>
            <th>Size</th>
            {
              global.user_group == 'admin' && !this.props.order &&
              <th>Options</th>
            }
            {
              this.props.order &&
              <th>Order</th>
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
      <PageBar pages={this.state.pages} selectPage={this.selectPage} />
    </div>;

    const add =
    <AddEditIngredient
      mode="add"
      backToList={this.backToList}
      finishAdd={this.finishAdd}
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

export default IngredientList;
