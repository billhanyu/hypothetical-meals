import React, { Component } from 'react';
import axios from 'axios';

class InventoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredient: {}
    };
  }

  componentDidMount() {
    const self = this;
    axios.get("/ingredients", {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(function (response) {
        for (let ingredient of response.data) {
          if (ingredient['id'] == self.props.item['ingredient_id']) {
            self.setState({
              ingredient
            });
            break;
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <tr>
        <th>{this.state.ingredient['name']}</th>
        <th>{this.props.item['total_weight']}</th>
      </tr>
    );
  }
}

export default InventoryItem;
