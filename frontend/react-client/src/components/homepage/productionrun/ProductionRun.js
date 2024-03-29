import React, { Component } from 'react';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import PageBar from '../../GeneralComponents/PageBar';
import ProductionRunFilterBar from './ProductionRunFilterBar';
import ProductionRunItem from './ProductionRunItem';
import AddEditIngredient from '../ingredient/AddEditIngredient';
import AddEditVendor from '../vendor/AddEditVendor';
import FormulaWindow from '../Formula/FormulaWindow';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';

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
      ingredient: null,
      viewIngredient: false,
      viewVendor: false,
      viewFormula: false,
      checkedActive: false,
      checkedInactive: false,
    };
    this.runs = [];
    this.filteredRuns = [];
    this.selectPage = this.selectPage.bind(this);
    this.search = this.search.bind(this);
    this.changeName = this.changeName.bind(this);
    this.changeStartTime = this.changeStartTime.bind(this);
    this.changeEndTime = this.changeEndTime.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.back = this.back.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.viewFormula = this.viewFormula.bind(this);
    this.viewVendor = this.viewVendor.bind(this);
    this.processData = this.processData.bind(this);
  }

  componentWillMount() {
    if (this.props.runs) {
      this.processData(this.props.runs);
      return;
    }
    axios.get('/productruns', {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.processData(response.data);
    })
    .catch(err => {
      this.setState({
        open: true,
        message: err.response.data
      });
    });
  }

  processData(data) {
    this.runs = data;
    this.filteredRuns = data;
    const pages = Math.ceil(this.filteredRuns.length / COUNT_PER_PAGE);
    this.setState({
      pages,
    });
    this.selectPage(1);
  }

  updateCheckActive() {
    this.setState({
      checkedActive: !this.state.checkedActive,
    }, () => {
      this.search();
    });
  }

  updateCheckInactive() {
    this.setState({
      checkedInactive: !this.state.checkedInactive,
    }, () => {
      this.search();
    });
  }

  viewIngredient(id) {
    axios.get(`/ingredients/id/${id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          ingredient: response.data,
          viewIngredient: true,
        });
      })
      .catch(err => {
        alert('Error retrieving ingredient data');
      });
  }

  viewVendor(id) {
    axios.get(`/vendors/id/${id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          vendor: response.data,
          viewVendor: true,
        });
      })
      .catch(err => {
        alert('Error retrieving vendor data');
      });
  }

  viewFormula(id) {
    axios.get(`/formulas/id/${id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          formula: response.data[0],
          viewFormula: true,
        });
      })
      .catch(err => {
        console.log(err);
        alert('Error retrieving formula data');
      });
  }

  back() {
    this.setState({
      viewIngredient: false,
      viewVendor: false,
      viewFormula: false,
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
      checkedActive: false,
      checkedInactive: false,
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
    if (this.state.checkedActive) {
      newRuns = newRuns.filter(element => {
        return element.completed == 0;
      });
    }
    if (this.state.checkedInactive) {
      newRuns = newRuns.filter(element => {
        return element.completed == 1;
      });
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

    const ingredient =
      <AddEditIngredient
        mode='edit'
        backToList={this.back}
        ingredient={this.state.ingredient}
      />;

    const viewVendor =
      <AddEditVendor
        mode="edit"
        vendor={this.state.vendor}
        backToList={this.back}
      />;

    const viewFormula =
      <FormulaWindow
        isEditing={true}
        BackButtonShown={true}
        onBackClick={this.back}
        newFormulaObject={this.state.formula}
        activeId={this.state.formula ? this.state.formula.id : 1}
      />;

    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        {
          this.props.runs
          ?
          <div>
            <h2>Recalled Runs</h2>
            <button type='button' className='btn btn-secondary' onClick={this.props.back}>
              Back
            </button>
          </div>
          :
          <h2>Production Runs</h2>
        }
        <ProductionRunFilterBar
          filterName={this.state.filterName}
          filterStartTime={this.state.filterStartTime}
          filterEndTime={this.state.filterEndTime}
          changeName={this.changeName}
          changeStartTime={this.changeStartTime}
          changeEndTime={this.changeEndTime}
          clearFilter={this.clearFilter}
        />
        <Checkbox
          label="Show Only Pending Runs"
          checked={this.state.checkedActive}
          onCheck={this.updateCheckActive.bind(this)}
        />
        <Checkbox
          label="Show Only Completed Runs"
          checked={this.state.checkedInactive}
          onCheck={this.updateCheckInactive.bind(this)}
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
              return <ProductionRunItem
                key={idx}
                run={run}
                idx={idx}
                viewIngredient={this.viewIngredient}
                viewFormula={this.viewFormula}
                viewVendor={this.viewVendor}
              />;
            })
          }
        </table>
        <PageBar
          selectPage={this.selectPage}
          pages={this.state.pages}
          currentPage={this.state.currentPage}
        />
      </div>;
    
    if (this.state.viewIngredient) {
      return ingredient;
    } else if (this.state.viewVendor) {
      return viewVendor;
    } else if (this.state.viewFormula) {
      return viewFormula;
    } else {
      return main;
    }
  }
}

ProductionRun.propTypes = {
  runs: PropTypes.array,
  back: PropTypes.func,
};

export default ProductionRun;
