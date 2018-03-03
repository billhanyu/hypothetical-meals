import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class SystemLogList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: []
    };
  }

  componentDidMount() {
    axios.get(`/systemlogs?ingredient_id=${this.props.ingredientId}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          logs: response.data,
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error retrieving sytem logs related to this ingredient');
      });
  }

  display(description) {
    let arr = description.split(/{|}/);
    for (let i = 1; i < arr.length; i += 2) {
      arr[i] = arr[i].split('=')[0];
    }
    return arr.join('');
  }

  render() {
    return(
      <div>
        <h3>Actions On This Ingredient</h3>
        <table className="table">
          <thead>
            <tr className="row" style={{ 'margin': 0 }}>
              <th className="col-md-3">Time</th>
              <th className="col-md-3">Username</th>
              <th className="col-md-6">Description</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.logs.map((log, idx) => {
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
      </div>
    );
  }
}

SystemLogList.propTypes = {
  ingredientId: PropTypes.number,
};

export default SystemLogList;