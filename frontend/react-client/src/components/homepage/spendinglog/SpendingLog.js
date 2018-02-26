import React, { Component } from 'react';
import PageBar from '../../GeneralComponents/PageBar';
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
        <h2>Spending Log</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Ingredient Name</th>
              <th>Total Unit Ordered</th>
              <th>Total Spending</th>
              <th>Production Spending</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.entries.map((entry, key) =>
                <SpendingLogEntry
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

export default SpendingLog;
