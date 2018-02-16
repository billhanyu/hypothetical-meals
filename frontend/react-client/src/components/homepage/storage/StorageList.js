import React, { Component } from 'react';
import axios from 'axios';

class StorageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storages: [],
    };
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/storages', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          storages: response.data,
        });
      })
      .catch(err => alert('error getting storages'));
  }

  render() {
    return (
      <div>
        <h2>Storages</h2>
        <table className="table">
          <thead>
            <tr>
              <th>id</th>
              <th>Name</th>
              <th>Capacity</th>
              {
                global.user_group == 'admin' &&
                <th>Options</th>
              }
            </tr>
          </thead>
          <tbody>
            {
              this.state.storages.map((storage, idx) => {
                return (
                  <tr key={idx}>
                    <td>{storage.id}</td>
                    <td>{storage.name}</td>
                    <td>{storage.capacity}</td>
                    {
                      global.user_group == 'admin' &&
                      <td>Edit</td>
                    }
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

export default StorageList;
