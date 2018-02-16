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
    };
    this.selectPage = this.selectPage.bind(this);
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
                  <IngredientListItem key={idx} ingredient={ingredient} />
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

export default IngredientList;
