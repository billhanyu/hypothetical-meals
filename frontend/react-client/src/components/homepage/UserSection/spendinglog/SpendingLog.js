import React, { Component } from 'react';
import PageBar from '../../../GeneralComponents/PageBar';
import axios from 'axios';
import SpendingLogEntry from './SpendingLogEntry';

class SpendingLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: 0,
      entries: [],
    };
    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    axios.get('/spendinglogs/pages', {
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
    axios.get(`/spendinglogs/page/${idx}`, {
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
        <div className="InventoryHead">
          <span className="InventoryColumn">Ingredient Name</span>
          <span className="InventoryColumn">Total Weight Ordered</span>
          <span className="InventoryColumn">Total Spending</span>
          <span className="InventoryColumn">Production Spending</span>
        </div>
        {
          this.state.entries.map((entry, key) =>
            <SpendingLogEntry
              item={entry}
              key={key}
            />
          )
        }
        <PageBar
          pages={this.state.pages}
          selectPage={this.selectPage}
        />
      </div>
    );
  }
}

export default SpendingLog;
