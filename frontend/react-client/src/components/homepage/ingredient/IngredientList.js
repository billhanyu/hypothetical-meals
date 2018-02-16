import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';
import IngredientListItem from './IngredientListItem';

class IngredientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [],
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
    axios.get(`/ingredients/page/${page}`, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      const ingredients = response.data.filter(ingredient => {
        return ingredient.removed.data[0] == 0;
      });
      this.setState({
        ingredients,
      });
    })
    .catch(err => console.error(err));
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
    return (
      <div>
        <h2>Ingredients</h2>
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
                  <IngredientListItem key={idx} idx={idx} delete={this.delete} ingredient={ingredient} />
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
      </div>
    );
  }
}

export default IngredientList;
