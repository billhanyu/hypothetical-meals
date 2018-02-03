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
      cartUp: false,
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
        <div className="CartBody">
          <div className="CartItem">
            <span className="CartItemColumn CartItemColumnHeader">Ingredient</span>
            <span className="CartItemColumn CartItemColumnHeader">Package</span>
            <span className="CartItemColumn CartItemColumnHeader">Quantity</span>
          </div>
          {
            this.props.cart.map((item, key) => {
              return <CartItem item={item} key={key} />;
            })
          }
        </div>
        <div className="CartOrder" onClick={this.props.checkout}>
          <span className="CartOrderText">Check Out</span>
        </div>
      </div>
    );
  }
}

export default Cart;
