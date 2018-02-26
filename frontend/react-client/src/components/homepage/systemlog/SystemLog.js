import React, { Component } from 'react';
import AddEditIngredient from '../ingredient/AddEditIngredient';
import SystemLogFilterBar from './SystemLogFilterBar';
import PageBar from '../../GeneralComponents/PageBar';
import axios from 'axios';

class SystemLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredLogs: [],
      logs: [],
      ingredient: null,
      viewIngredient: false,
      pages: 0,
    };
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
    axios.get('/systemlogs/pages', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          pages: response.data.numPages,
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error retrieving system logs');
      });
    this.selectPage(1);
  }

  selectPage(idx) {
    axios.get(`/systemlogs/page/${idx}`, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      this.setState({
        logs: response.data,
        filteredLogs: response.data,
      });
    })
    .catch(err => {
      console.error(err);
      alert('Error retrieving system logs');
    });
  }

  back() {
    this.setState({
      viewIngredient: false,
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
    let newLogs = this.state.logs.slice();
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
    this.setState({
      filteredLogs: newLogs,
    });
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

  display(description) {
    const parts = [];
    let op = description;
    while (op.indexOf('{') > -1) {
      const indexBracket = op.indexOf('{');
      const indexClose = op.indexOf('}');
      if (op.substring(indexBracket + 1, indexBracket + 2) == 'f') {
        parts.push(<span>{op.substring(0, indexBracket)}</span>);
        op = op.substring(indexClose+1);
        continue;
      }
      const indexSpace = op.substring(0, indexBracket).lastIndexOf(' ');
      const withinBrackets = op.substring(indexBracket, indexClose);
      const id = parseInt(withinBrackets.split(':')[1]);
      parts.push(<span>{op.substring(0, indexSpace+1)}</span>);
      parts.push(<a href="javascript:void(0)" onClick={e=>this.viewIngredient(id)}>{op.substring(indexSpace+1, indexBracket)}</a>);
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
              this.state.filteredLogs.map((log, idx) => {
                return (
                  <tr className="row" style={{ 'margin': 0 }} key={idx}>
                    <td className="col-md-3">{log.created_at.split('T')[0]}</td>
                    <td className="col-md-3">{log.username}</td>
                    <td className="col-md-6">{this.display(log.description)}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <PageBar pages={this.state.pages} selectPage={this.selectPage} />
      </div>;
    return this.state.viewIngredient ? viewIng : systemlog;
  }
}

export default SystemLog;
