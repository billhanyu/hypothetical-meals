import React, { Component } from 'react';
import CartItem from './CartItem';

class Cart extends Component {
  constructor(props) {
    super(props);
    this.cartUpTranslateStyle = {
      'transform': 'translate(0, -450px)',
      '-webkit-transform': 'translate(0, -450px)',
      '-o-transform': 'translate(0, -450px)',
      '-moz-transform': 'translate(0, -450px)',
      '-webkit-transition-duration': '0.5s',
      '-moz-transition-duration': '0.5s',
      '-o-transition-duration': '0.5s',
      'transition-duration': '0.5s',
    };
    this.cartDownTranslateStyle = {
      'transform': '',
      '-webkit-transform': '',
      '-o-transform': '',
      '-moz-transform': '',
      '-webkit-transition-duration': '0.5s',
      '-moz-transition-duration': '0.5s',
      '-o-transition-duration': '0.5s',
      'transition-duration': '0.5s',
    };
    this.state = {
      cartStyle: this.cartDownTranslateStyle,
    };
    this.onClickHeader = this.onClickHeader.bind(this);
  }

  onClickHeader() {
    if (this.state.cartUp) {
      this.setState({
        cartUp: false,
        cartStyle: this.cartDownTranslateStyle,
      });
    } else {
      this.setState({
        cartUp: true,
        cartStyle: this.cartUpTranslateStyle,
      });
    }
  }

  reset() {
    this.setState({
      cartUp: false,
      cartStyle: this.cartDownTranslateStyle,
    });
  }

  render() {
    return (
      <div className="InventoryCart" style={this.state.cartStyle}>
        <div className="CartHeader" onClick={this.onClickHeader}>
          <span className="CartHeaderText">Cart ({this.props.cart.length})</span>
        </div>
        <table className="table" style={{'background-color': 'white'}}>
          <thead>
            <th>
            <div
              className="fa fa-remove CartDeleteColumn DeleteCartItem"
              aria-hidden="true"
              style={{'color': 'rgba(0,0,0,0)', 'cursor': ''}}
            />
            </th>
            <th>Ingredient</th>
            <th>Quantity</th>
          </thead>
          <tbody>
          {
            this.props.cart.map((item, key) => {
              return <CartItem
                item={item}
                key={key}
                setQuantity={this.props.setQuantity}
                removeItem={this.props.removeItem}
              />;
            })
          }
          </tbody>
        </table>
        <div className="CartOrder" onClick={this.props.order}>
          <span className="CartOrderText">Choose Vendors</span>
        </div>
      </div>
    );
  }
}

export default Cart;
