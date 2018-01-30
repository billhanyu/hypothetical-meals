import React, { Component } from 'react';
import axios from 'axios';
import Storage2State from '../../../Constants/Storage2State';

class InventoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredient: {},
      storage: {},
    };
  }

  componentDidMount() {
    const self = this;
    axios.get("/ingredients", {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(function (response) {
        for (let ingredient of response.data) {
          if (ingredient.id == self.props.item.ingredient_id) {
            self.setState({
              ingredient
            });
            self.updateForStorage(self.props);
            break;
          }
        }
      })
      .catch(error => {
      });
  }

  componentWillReceiveProps(nextProps) {
    this.updateForStorage(nextProps);
  }

  updateForStorage(props) {
    for (let storage of props.storages) {
      if (storage.id == this.state.ingredient.storage_id) {
        this.setState({
          storage
        });
        break;
      }
    }
  }

  render() {
    return (
      <div className="InventoryRow">
        <span className="InventoryColumn">{this.state.ingredient.name}</span>
        <span className="InventoryColumn">{Storage2State[this.state.storage.name]}</span>
        <span className="InventoryColumn">{this.props.item.total_weight}</span>
      </div>
    );
  }
}

export default InventoryItem;
