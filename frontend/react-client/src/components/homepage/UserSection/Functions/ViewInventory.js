import React, { Component } from 'react';
import axios from 'axios';
import InventoryItem from '../Components/InventoryItem';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventories: [],
    };
  }

  componentDidMount() {
    const self = this;
    axios.get("/inventory", {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(function (response) {
        console.log(response);
        self.setState({
          inventories: response.data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <table style={{width: '100%'}}>
        <tr>
          <th>Ingredient Name</th>
          <th>Weight</th>
        </tr>
        {this.state.inventories.map((item, key) => <InventoryItem key={key} item={item} token={this.props.token}/>)}
      </table>
    );
  }
}

export default ViewInventory;
