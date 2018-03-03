import React, { Component } from 'react';
import AddEditIngredient from '../ingredient/AddEditIngredient';
import AddEditVendor from '../vendor/AddEditVendor';
import SystemLogFilterBar from './SystemLogFilterBar';
import PageBar from '../../GeneralComponents/PageBar';
import axios from 'axios';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';

class SystemLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedLogs: [],
      ingredient: null,
      viewIngredient: false,
      vendor: null,
      viewVendor: false,
      pages: 0,
      currentPage: 1,
    };
    this.filteredLogs = [];
    this.changeName = this.changeName.bind(this);
    this.changeStartTime = this.changeStartTime.bind(this);
    this.changeEndTime = this.changeEndTime.bind(this);
    this.changeUser = this.changeUser.bind(this);
    this.search = this.search.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.back = this.back.bind(this);
    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    axios.get('/systemlogs', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.filteredLogs = response.data;
        this.logs = response.data;
        this.selectPage(1);
        this.setState({
          pages: Math.ceil(response.data.length / COUNT_PER_PAGE),
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error retrieving system logs');
      });
  }

  selectPage(idx) {
    const pagedLogs = [];
    for (let i = (idx-1) * COUNT_PER_PAGE; i < idx*COUNT_PER_PAGE && i < this.filteredLogs.length; i++) {
      pagedLogs.push(this.filteredLogs[i]);
    }
    this.setState({
      pagedLogs,
      currentPage: idx,
    });
  }

  back() {
    this.setState({
      viewIngredient: false,
      viewVendor: false,
    });
  }

  changeName(event) {
    this.filterName = event.target.value;
    this.search();
  }

  changeStartTime(event) {
    this.filterStartTime = event.target.value;
    this.search();
  }

  changeEndTime(event) {
    this.filterEndTime = event.target.value;
    this.search();
  }

  changeUser(event) {
    this.filterUser = event.target.value;
    this.search();
  }

  search() {
    let newLogs = this.logs.slice();
    if (this.filterName) {
      newLogs = newLogs.filter(log => {
        const lowerDescription = log.description.toLowerCase();
        const lowerName = this.filterName.toLowerCase();
        return lowerDescription.indexOf(lowerName) > -1;
      });
    }
    if (this.filterStartTime) {
      newLogs = newLogs.filter(log => log.created_at.split('T')[0] >= this.filterStartTime);
    }
    if (this.filterEndTime) {
      newLogs = newLogs.filter(log => log.created_at.split('T')[0] <= this.filterEndTime);
    }
    if (this.filterUser) {
      newLogs = newLogs.filter(log => log.username.indexOf(this.filterUser) > -1);
    }
    this.filteredLogs = newLogs;
    const newPageNum = Math.ceil(this.filteredLogs.length / COUNT_PER_PAGE);
    this.setState({
      pages: newPageNum,
    });
    this.selectPage(1);
  }

  viewIngredient(id) {
    axios.get(`/ingredients/id/${id}`, {
      headers: {Authorization: "Token " + global.token}
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

  display(description) {
    const parts = [];
    let op = description;
    while (op.indexOf('{') > -1) {
      const indexBracket = op.indexOf('{');
      const indexClose = op.indexOf('}');
      parts.push(<span>{op.substring(0, indexBracket)}</span>);
      const encoded = op.substring(indexBracket + 1, indexClose);
      const arr = encoded.split('=');
      const id = arr[2];
      if (arr[1] == 'ingredient_id') {
        parts.push(<a href="javascript:void(0)" onClick={e => this.viewIngredient(id)}>{arr[0]}</a>);
      } else if (arr[1] == 'formula_id') {
        parts.push(<span>{arr[0]}</span>);
      } else if (arr[1] == 'vendor_id') {
        parts.push(<a href="javascript:void(0)" onClick={e => this.viewVendor(id)}>{arr[0]}</a>);
      }
      op = op.substring(indexClose+1);
    }
    parts.push(<span>{op}</span>);
    return parts;
  }

  render() {
    const viewIng =
      <AddEditIngredient
        mode="edit"
        ingredient={this.state.ingredient}
        backToList={this.back}
      />;
    
    const viewVendor =
      <AddEditVendor
        mode="edit"
        vendor={this.state.vendor}
        backToList={this.back}
      />;

    const systemlog =
      <div>
        <h2>System Log</h2>
        <SystemLogFilterBar
          filterName={this.state.filterName}
          filterStartTime={this.state.filterStartTime}
          filterEndTime={this.state.filterEndTime}
          filterUser={this.state.filterUser}
          changeName={this.changeName}
          changeStartTime={this.changeStartTime}
          changeEndTime={this.changeEndTime}
          changeUser={this.changeUser}
          search={this.search}
        />
        <table className="table">
          <thead>
            <tr className="row" style={{'margin': 0}}>
              <th className="col-md-3">Time</th>
              <th className="col-md-3">Username</th>
              <th className="col-md-6">Description</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.pagedLogs.map((log, idx) => {
                return (
                  <tr className="row" style={{ 'margin': 0 }} key={idx}>
                    <td className="col-md-3">{(new Date(log.created_at)).toString().split(' GMT')[0]}</td>
                    <td className="col-md-3">{log.username}</td>
                    <td className="col-md-6">{this.display(log.description)}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <PageBar pages={this.state.pages} selectPage={this.selectPage} currentPage={this.state.currentPage} />
      </div>;
    if (this.state.viewIngredient) {
      return viewIng;
    } else if (this.state.viewVendor) {
      return viewVendor;
    } else {
      return systemlog;
    }
  }
}

export default SystemLog;
