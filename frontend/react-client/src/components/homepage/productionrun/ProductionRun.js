import React, { Component } from 'react';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import PageBar from '../../GeneralComponents/PageBar';
import ProductionRunFilterBar from './ProductionRunFilterBar';
import ProductionRunItem from './ProductionRunItem';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';

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

  componentDidMount() {
    axios.get('/productruns', {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.runs = response.data;
      this.filteredRuns = response.data;
      const pages = Math.ceil(this.filteredRuns.length / COUNT_PER_PAGE);
      this.setState({
        pages,
      });
      this.selectPage(1);
    })
    .catch(err => {
      this.setState({
        open: true,
        message: err.response.data
      });
    });
  }

  selectPage(idx) {
    const pagedRuns = [];
    for (let i = (idx - 1) * COUNT_PER_PAGE; i < idx * COUNT_PER_PAGE && i < this.filteredRuns.length; i++) {
      pagedRuns.push(this.filteredRuns[i]);
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
        const lowerRunName = run.name.toLowerCase(); // assuming formula_name
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

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const columnClass = "OneFifthWidth";
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
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
            <tr style={{ 'margin': 0 }}>
              <th className={columnClass}>Time</th>
              <th className={columnClass}>User</th>
              <th className={columnClass}>Product</th>
              <th className={columnClass}>Number Produced</th>
              <th className={columnClass}>Lot Number</th>
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
