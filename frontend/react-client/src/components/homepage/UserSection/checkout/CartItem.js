import React, { Component } from 'react';

class CartItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overflow: false
    };
    this.changeQuantity = this.changeQuantity.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item.quantity > nextProps.item.num_packages || nextProps.item.quantity <= 0) {
      this.setState({
        overflow: true
      });
    } else {
      this.setState({
        overflow: false
      });
    }
  }

  remove() {
    this.props.removeItem(this.props.item.id);
  }

  changeQuantity(e) {
    this.props.setQuantity(this.props.item, parseInt(e.target.value));
  }

  render() {
    const inputClassName = `CartQuantityColumn${this.state.overflow ? " Overflow" : ""}`;
    return (
      <div className="CartItem">
        <div
          className="glyphicon glyphicon-remove CartDeleteColumn DeleteCartItem"
          aria-hidden="true"
          onClick={this.remove}
        />
        <span className="CartItemColumn">{this.props.item.ingredient_name}</span>
        <span className="CartItemColumn">{this.props.item.package_type}</span>
        <input
          type="number"
          className={inputClassName}
          onChange={this.changeQuantity}
          value={this.props.item.quantity} 
        />
      </div>
    );
  }
}

export default CartItem;
