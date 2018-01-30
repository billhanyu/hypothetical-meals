import React, { Component } from 'react';
import axios from 'axios';
import InventoryItem from '../Components/InventoryItem';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventories: [],
      storages: [],
    };
  }

  componentDidMount() {
    const self = this;
    axios.get("/inventory", {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(response => {
        self.setState({
          inventories: response.data
        });
        return axios.get('/storages', {
          headers: { Authorization: "Token " + this.props.token }
        });
      })
      .then(response => {
        self.setState({
          storages: response.data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <div className="InventoryHead">
          <span className="InventoryColumn">Ingredient Name</span>
          <span className="InventoryColumn">Temperature State</span>
          <span className="InventoryColumn">Weight</span>
        </div>
        {this.state.inventories.map((item, key) =>
          <InventoryItem
            key={key}
            item={item}
            storages={this.state.storages}
            token={this.props.token}
          />
        )}
      </div>
    );
  }
}

export default ViewInventory;
