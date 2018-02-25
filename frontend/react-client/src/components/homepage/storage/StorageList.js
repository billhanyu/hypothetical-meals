import React, { Component } from 'react';
import axios from 'axios';

class StorageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storages: [],
      editIdx: -1,
      editCapacity: 0,
    };
    this.edit = this.edit.bind(this);
    this.changeCapacity = this.changeCapacity.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
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

  edit(idx) {
    this.setState({
      editIdx: idx,
      editCapacity: this.state.storages[idx].capacity,
    });
  }

  changeCapacity(event) {
    this.setState({
      editCapacity: event.target.value,
    });
  }

  cancelEdit() {
    this.setState({
      editIdx: -1,
    });
  }

  finishEdit() {
    const putObj = {};
    const id = this.state.storages[this.state.editIdx].id;
    putObj[id] = this.state.editCapacity;
    axios.put('/storages', putObj, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        editIdx: -1,
      });
      alert('Updated!');
      this.reloadData();
    })
    .catch(err => {
      const message = err.response.data;
      alert(message);
    });
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
              <th>Occupied Space</th>
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
                    <td>
                      {
                        this.state.editIdx == idx
                          ?
                          <div>
                            <input type="number" onChange={this.changeCapacity} value={this.state.editCapacity} />
                            <span>&nbsp;&nbsp;sqft</span>
                          </div>
                          :
                          storage.capacity + " sqft"
                      }
                    </td>
                    <td>{storage.used + " sqft"}</td>
                    {
                      global.user_group == 'admin' && this.state.editIdx !== idx &&
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={e => this.edit(idx)}>
                          Edit
                        </button>
                      </td>
                    }
                    {
                      global.user_group == 'admin' && this.state.editIdx == idx &&
                      <td>
                      <div className="btn-group" role="group" aria-label="Basic example">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={this.cancelEdit}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={this.finishEdit}>
                          Confirm
                        </button>
                      </div>
                    </td>
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
