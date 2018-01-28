import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// COMPONENT INFO: Refers to a table row
class CoinPortfolioTableRow extends Component {
  constructor(props) {
    super(props);
    /** REQUIRED PROPS:
      1. coinAbbrev (String)
      2. coinFull (String)
      3. coinImgName (String) ex. eth.svg
      4. coinAmt (String)
      5. coinValue (String)
      6. coinValueBTC (String)
      7. coinPercTotal (String) ex. 10.235
      8. coinPrice (String) ex. 1193.4613499
      9. coinPriceBTC (String)
      10. trendDay (String) ex. 1.913
    */
  }

  render() {
    return (
      <tr>
        <td>
          <div className="currencyColumnCell">
            <img src={`/images/${this.props.coinImgName}`} className="currencyImage" />
            <div className="currencyTextContainer">
              <Link to="" className="currencyAbbrev"> {this.props.coinAbbrev} </Link>
              <div className="currencyFull"> {this.props.coinFull} </div>
            </div>
          </div>
        </td>
        <td>{this.props.coinAmt + ' '} {this.props.coinAbbrev}</td>
        <td>
          <div className="ValueTextContainer">
            <div className="ValueUSD"> ${this.props.coinValue} USD </div>
            <div className="ValueBTC"> {this.props.coinValueBTC} BTC </div>
          </div>
        </td>
        <td>{this.props.coinPercTotal}%</td>
        <td>
          <div className="PriceTextContainer">
            <div className="PriceUSD"> ${this.props.coinPrice} USD </div>
            <div className="PriceBTC"> {this.props.coinPriceBTC} BTC </div>
          </div>
        </td>
        <td>
          <span style={{color: this.props.trendDay >= 0 ? 'green' : 'red'}}> {this.props.trendDay >= 0 ? '+' : null}{this.props.trendDay}% </span>
        </td>
      </tr>
    )
  }
}

export default CoinPortfolioTableRow;
