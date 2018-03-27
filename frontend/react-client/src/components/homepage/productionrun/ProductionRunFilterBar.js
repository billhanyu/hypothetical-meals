import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
              <label htmlFor="name">Product Name</label>
              <input type="text" className="form-control" id="name" value={this.props.filterName} onChange={this.props.changeName} />
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
          <div className="col">
            <button
              style={{'margin-top': '35px'}}
              type="button"
              className="btn btn-secondary"
              onClick={this.props.clearFilter}>
              Clear
            </button>
          </div>
        </div>
      </form>
    );
  }
}

SystemLogFilterBar.propTypes = {
  filterName: PropTypes.string,
  filterStartTime: PropTypes.string,
  filterEndTime: PropTypes.string,
  clearFilter: PropTypes.func,
  changeName: PropTypes.func,
  changeStartTime: PropTypes.func,
  changeEndTime: PropTypes.func,
};

export default SystemLogFilterBar;
