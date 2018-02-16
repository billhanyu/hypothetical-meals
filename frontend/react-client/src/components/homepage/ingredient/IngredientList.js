import React, { Component } from 'react';
import axios from 'axios';
import PageBar from '../../GeneralComponents/PageBar';

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
      this.setState({
        ingredients: response.data,
      });
    })
    .catch(err => console.error(err));
  }

  render() {

    console.log(this.state.ingredients);
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
            </tr>
          </thead>
          <tbody>
            {
              this.state.ingredients.map((ingredient, idx) => {
                return (
                  <tr key={idx}>
                    <td>{ingredient.id}</td>
                    <td>{ingredient.name}</td>
                    <td>{ingredient.package_type}</td>
                    <td>{ingredient.storage_name}</td>
                    <td>{ingredient.native_unit}</td>
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

export default IngredientList;
