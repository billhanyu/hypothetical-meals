import React, { Component } from 'react';

class SystemLogFilterBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <form>
        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="name">Description</label>
              <input type="text" className="form-control" id="name" value={this.props.filterName} onChange={this.props.changeName} />
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" className="form-control" id="username" value={this.props.filterUser} onChange={this.props.changeUser} />
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label htmlFor="start">Start Date</label>
              <input type="date" className="form-control" id="start" value={this.props.filterStartTime} onChange={this.props.changeStartTime} />
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label htmlFor="end">End Date</label>
              <input type="date" className="form-control" id="end" value={this.props.filterEndTime} onChange={this.props.changeEndTime} />
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={this.props.clearFilter}>Clear</button>
      </form>
    );
  }
}

export default SystemLogFilterBar;
