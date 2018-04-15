import React, { Component } from 'react';
import EfficiencyResult from './EfficiencyResult';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import qs from 'qs';

class EfficiencyReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewReport: false,
      result: {
        occupancies: [],
        total_lines: 1,
        total_time: 0,
      },
      start: '',
      end: '',
      open: false,
      message: '',
    };
    this.viewReport = this.viewReport.bind(this);
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
    this.back = this.back.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  viewReport(e) {
    e.preventDefault();
    if (!this.state.start || !this.state.end) {
      this.setState({
        open: true,
        message: 'You have not specified both start end end dates',
      });
      return;
    }
    axios.get(`/efficiency`, {
      params: {
        from_date: this.state.start,
        to_date: this.state.end,
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
      headers: { Authorization: "Token " + global.token },
    })
      .then(response => {
        this.setState({
          result: response.data,
          viewReport: true,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data,
        });
      });
  }

  changeStart(e) {
    this.setState({
      start: e.target.value,
    });
  }

  changeEnd(e) {
    this.setState({
      end: e.target.value,
    });
  }

  back() {
    this.setState({
      viewReport: false,
    });
  }
  
  render() {
    const main =
      <div>
        <h2>Efficiency Report</h2>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <form>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label htmlFor="start">Start Date</label>
                <input type="date" className="form-control" id="start" value={this.state.start} onChange={this.changeStart} />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label htmlFor="end">End Date</label>
                <input type="date" className="form-control" id="end" value={this.state.end} onChange={this.changeEnd} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.viewReport}>Generate Rport</button>
        </form>
      </div>;
    
    const report = <EfficiencyResult back={this.back} result={this.state.result} />;

    return this.state.viewReport ? report : main;
  }
}

export default EfficiencyReport;
