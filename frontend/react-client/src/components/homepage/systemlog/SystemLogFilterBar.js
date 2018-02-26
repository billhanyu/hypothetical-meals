import React, { Component } from 'react';

class SystemLogFilterBar extends Component {
  render() {
    return (
      <div className="row justify-content-md-center">
        <form className="col-xl-6 col-lg-6 col-sm-8">
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label htmlFor="name">Ingredient Name</label>
                <input type="text" className="form-control" id="name" value={this.props.filterName} onChange={this.props.changeName} />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" className="form-control" id="username" value={this.props.filterUser} onChange={this.props.changeUser} />
              </div>
            </div>
          </div>
          <div className="row">
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
        </form>
      </div>
    );
  }
}

export default SystemLogFilterBar;
