import React, { Component } from 'react';
import COUNT_PER_PAGE from '../../Constants/Pagination';
import PageBar from '../../GeneralComponents/PageBar';
import ProductionRunFilterBar from './ProductionRunFilterBar';
import ProductionRunItem from './ProductionRunItem';

class ProductionRun extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedRuns: [],
      pages: 0,
      currentPage: 1,
      filterStartTime: '',
      filterEndTime: '',
      filterName: '',
    };
    this.runs = [];
    this.filteredRuns = [];
    this.selectPage = this.selectPage.bind(this);
    this.search = this.search.bind(this);
    this.changeName = this.changeName.bind(this);
    this.changeStartTime = this.changeStartTime.bind(this);
    this.changeEndTime = this.changeEndTime.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
  }

  selectPage(idx) {
    const pagedRuns = [];
    for (let i = (idx - 1) * COUNT_PER_PAGE; i < idx * COUNT_PER_PAGE && i < this.filteredLogs.length; i++) {
      pagedRuns.push(this.filteredLogs[i]);
    }
    this.setState({
      pagedRuns,
      currentPage: idx,
    });
  }

  changeName(event) {
    this.setState({
      filterName: event.target.value,
    }, () => this.search());
  }

  changeStartTime(event) {
    this.setState({
      filterStartTime: event.target.value,
    }, () => this.search());
  }

  changeEndTime(event) {
    this.setState({
      filterEndTime: event.target.value,
    }, () => this.search());
  }

  clearFilter() {
    this.setState({
      filterName: '',
      filterStartTime: '',
      filterEndTime: '',
    }, () => this.search());
  }

  search() {
    let newRuns = this.runs.slice();
    if (this.state.filterName) {
      newRuns = newRuns.filter(run => {
        const lowerRunName = run.formula_name.toLowerCase(); // assuming formula_name
        const lowerName = this.state.filterName.toLowerCase();
        return lowerRunName.indexOf(lowerName) > -1;
      });
    }
    if (this.state.filterStartTime) {
      newRuns = newRuns.filter(run => run.created_at.split('T')[0] >= this.state.filterStartTime);
    }
    if (this.state.filterEndTime) {
      newRuns = newRuns.filter(run => run.created_at.split('T')[0] <= this.state.filterEndTime);
    }
    this.filteredRuns = newRuns;
    const newPageNum = Math.ceil(this.filteredRuns.length / COUNT_PER_PAGE);
    this.setState({
      pages: newPageNum,
    });
    this.selectPage(1);
  }

  render() {
    return (
      <div>
        <h3>Production Runs</h3>
        <ProductionRunFilterBar
          filterName={this.state.filterName}
          filterStartTime={this.state.filterStartTime}
          filterEndTime={this.state.filterEndTime}
          changeName={this.changeName}
          changeStartTime={this.changeStartTime}
          changeEndTime={this.changeEndTime}
          clearFilter={this.clearFilter}
        />
        <table className="table">
          <thead>
            <tr className="row" style={{ 'margin': 0 }}>
              <th className="col-md-3">Time</th>
              <th className="col-md-3">User</th>
              <th className="col-md-3">Number Produced</th>
              <th className="col-md-3">Lot Number</th>
            </tr>
          </thead>
          {
            this.state.pagedRuns.map((run, idx) => {
              return <ProductionRunItem key={idx} run={run} idx={idx} />;
            })
          }
        </table>
        <PageBar
          selectPage={this.selectPage}
          pages={this.state.pages}
          currentPage={this.state.currentPage}
        />
      </div>
    );
  }
}

export default ProductionRun;
