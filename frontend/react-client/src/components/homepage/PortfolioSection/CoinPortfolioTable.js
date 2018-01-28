import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CoinPortfolioTableRow from './CoinPortfolioTableRow.js';

// COMPONENT INFO: Refers to the actual table for portfolio
class CoinPortfolioTable extends Component {
  constructor(props) {
    super(props);
    this.state =
      {
        dummyData:[{
          coinAbbrev:'ETH',
          coinFull:'Ethereum',
          coinImgName:'eth.svg',
          coinAmt:'4.80710038',
          coinValue:'5737.10',
          coinValueBTC:'0.42404605',
          coinPercTotal:'10.235',
          coinPrice:'1193.4631499',
          coinPriceBTC:'0.08821244000',
          trendDay:'1.913'
        }]
      };
  }
  // DO Total Coin change since ownership
  render() {
    return (
      <table className="homeCoinTable">
        <thead>
          <tr className="ColumnHeaders">
            <th>Currency</th>
            <th>Amount</th>
            <th>Value</th>
            <th>% of Total</th>
            <th>Coin Price</th>
            <th> Trend (24H)</th>
          </tr>
        </thead>
        <tbody>
          {
            this.state.dummyData.map((element, index) => {
              return <CoinPortfolioTableRow key={index} {...element}/>
            })
          }
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/salt.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> SALT </Link>
                  <div className="currencyFull"> Salt </div>
                </div>
              </div>
            </td>
            <td>5277.0000 SALT</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $3335.22 USD </div>
                <div className="ValueBTC"> 0.25585143 BTC </div>
              </div>
            </td>
            <td>4.691%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $10.76677213 USD </div>
                <div className="PriceBTC"> 0.0008259400 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'red'}}> -26.29% </span>
            </td>
          </tr>
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/xlm.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> XLM </Link>
                  <div className="currencyFull"> Ripple </div>
                </div>
              </div>
            </td>
            <td>5277.0000 XLM</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $2383.10 USD </div>
                <div className="ValueBTC"> 0.18279582 BTC </div>
              </div>
            </td>
            <td>3.218%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $0.45155942 USD </div>
                <div className="PriceBTC"> 0.000034640 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'red'}}> -19.76% </span>
            </td>
          </tr>
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/xrp.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> XRP </Link>
                  <div className="currencyFull"> Stellarlumens </div>
                </div>
              </div>
            </td>
            <td>5277.0000 XRP</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $1686.93 USD </div>
                <div className="ValueBTC"> 0.12940753 BTC </div>
              </div>
            </td>
            <td>1.482%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $3.89443928 USD </div>
                <div className="PriceBTC"> 0.000298750 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'green'}}> +6.892% </span>
            </td>
          </tr>
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/steem.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> STEEM </Link>
                  <div className="currencyFull"> Steem </div>
                </div>
              </div>
            </td>
            <td>3.80710038 STEEM</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $5737.10 USD </div>
                <div className="ValueBTC"> 0.42404605 BTC </div>
              </div>
            </td>
            <td>10.235%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $1193.4631499 USD </div>
                <div className="PriceBTC"> 0.08821244000 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'red'}}> -10.913% </span>
            </td>
          </tr>
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/salt.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> SALT </Link>
                  <div className="currencyFull"> Salt </div>
                </div>
              </div>
            </td>
            <td>5277.0000 SALT</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $3335.22 USD </div>
                <div className="ValueBTC"> 0.25585143 BTC </div>
              </div>
            </td>
            <td>4.691%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $10.76677213 USD </div>
                <div className="PriceBTC"> 0.0008259400 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'green'}}> +17.793% </span>
            </td>
          </tr>
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/xlm.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> XLM </Link>
                  <div className="currencyFull"> Ripple </div>
                </div>
              </div>
            </td>
            <td>5277.0000 XLM</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $2383.10 USD </div>
                <div className="ValueBTC"> 0.18279582 BTC </div>
              </div>
            </td>
            <td>3.218%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $0.45155942 USD </div>
                <div className="PriceBTC"> 0.000034640 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'green'}}> +8.761% </span>
            </td>
          </tr>
          <tr>
            <td>
              <div className="currencyColumnCell">
                <img src="/images/xrp.png" className="currencyImage" />
                <div className="currencyTextContainer">
                  <Link to="" className="currencyAbbrev"> XRP </Link>
                  <div className="currencyFull"> Stellarlumens </div>
                </div>
              </div>
            </td>
            <td>5277.0000 XRP</td>
            <td>
              <div className="ValueTextContainer">
                <div className="ValueUSD"> $1686.93 USD </div>
                <div className="ValueBTC"> 0.12940753 BTC </div>
              </div>
            </td>
            <td>1.482%</td>
            <td>
              <div className="PriceTextContainer">
                <div className="PriceUSD"> $3.89443928 USD </div>
                <div className="PriceBTC"> 0.000298750 BTC </div>
              </div>
            </td>
            <td>
              <span style={{color: 'red'}}> -6.892% </span>
            </td>
            </tr>
          </tbody>
      </table>
    )
  }
}

export default CoinPortfolioTable;
