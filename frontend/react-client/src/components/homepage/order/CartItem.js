import React, { Component } from 'react';

class CartItem extends Component {
  constructor(props) {
    super(props);
    this.changeQuantity = this.changeQuantity.bind(this);
    this.remove = this.remove.bind(this);
  }

  remove() {
    this.props.removeItem(this.props.item.id);
  }

  changeQuantity(e) {
    this.props.setQuantity(this.props.item, parseInt(e.target.value));
  }

  render() {
    return (
      <tr>
        <td>
        <div
          className="fa fa-remove DeleteCartItem"
          aria-hidden="true"
          onClick={this.remove}
        />
        </td>
        <td>{this.props.item.name}</td>
        <td>
        <input
          type="number"
          onChange={this.changeQuantity}
          value={this.props.item.quantity} 
        />
        </td>
      </tr>
    );
  }
}

export default CartItem;
