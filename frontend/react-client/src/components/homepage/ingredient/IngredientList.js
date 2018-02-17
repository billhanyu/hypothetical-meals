import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';
import IngredientListItem from './IngredientListItem';
import AddEditIngredient from './AddEditIngredient';

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
      editingIdx: 0,
    };
    this.selectPage = this.selectPage.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
    this.add = this.add.bind(this);
    this.finishAdd = this.finishAdd.bind(this);
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
      .catch(err => console.error(err));
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
      const ingredients = response.data.filter(ingredient => {
        return ingredient.removed.data[0] == 0;
      });
      ingredients.sort((a, b) => a.id - b.id);
      this.setState({
        ingredients,
      });
    })
    .catch(err => console.error(err));
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
    })
    .catch(err => {
      alert('Some error occurred');
    });
  }

  render() {
    const edit =
    <AddEditIngredient
      mode="edit"
      ingredient={this.state.ingredients[this.state.editingIdx]}
      finishEdit={this.finishEdit}
    />;

    const main = 
    <div>
      <h2>Ingredients</h2>
      {global.user_group == 'admin' && <button type="button" className="btn btn-primary" onClick={this.add}>Add Ingredient</button>}
      <table className="table">
        <thead>
          <tr>
            <th>id</th>
            <th>Name</th>
            <th>Package Type</th>
            <th>Storage</th>
            <th>Unit</th>
            {
              global.user_group == 'admin' &&
              <th>Options</th>
            }
          </tr>
        </thead>
        <tbody>
          {
            this.state.ingredients.map((ingredient, idx) => {
              return (
                <IngredientListItem
                  key={idx}
                  idx={idx}
                  edit={this.edit}
                  delete={this.delete}
                  ingredient={ingredient}
                />
              );
            })
          }
        </tbody>
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
      finishAdd={this.finishAdd}
    />;

    if (this.state.editing) {
      return edit;
    } else if (this.state.adding) {
      return add;
    } else {
      return main;
    }
  }
}

export default IngredientList;
