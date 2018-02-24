import React, { Component } from 'react';
import PageBar from '../../GeneralComponents/PageBar';
import axios from 'axios';
import ProductionLogEntry from './ProductionLogEntry';

class ProductionLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: 0,
      entries: [],
    };
    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    axios.get('/productionlogs/pages', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          pages: response.data.numPages
        });
        this.selectPage(1);
      });
  }

  selectPage(idx) {
    axios.get(`/productionlogs/page/${idx}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          entries: response.data
        });
      });
  }

  render() {
    return (
      <div>
        <h2>Production Log</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Formula Name</th>
              <th>Total Product Produced</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.entries.map((entry, key) =>
                <ProductionLogEntry
                  item={entry}
                  key={key}
                />
              )
            }
          </tbody>
        </table>
        <PageBar
          pages={this.state.pages}
          selectPage={this.selectPage}
        />
      </div>
    );
  }
}

export default ProductionLog;
