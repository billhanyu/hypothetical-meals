import React, { Component } from 'react';
import EfficiencyResult from './EfficiencyResult';

class EfficiencyReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewReport: false,
      start: '',
      end: '',
    };
    this.viewReport = this.viewReport.bind(this);
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
    this.back = this.back.bind(this);
  }

  viewReport(e) {
    e.preventDefault();
    this.setState({
      viewReport: true,
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
    
    const report = <EfficiencyResult back={this.back} />;

    return this.state.viewReport ? report : main;
  }
}

export default EfficiencyReport;
