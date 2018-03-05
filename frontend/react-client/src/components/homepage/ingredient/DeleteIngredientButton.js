import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class DeleteIngredientButton extends Component {
  constructor(props) {
    super(props);
    this.confirmDelete = this.confirmDelete.bind(this);
  }

  confirmDelete() {
    axios.delete('/ingredients', {
      data: {
        ingredients: [this.props.id]
      },
      headers: {
        Authorization: "Token " + global.token
      }
    })
      .then(response => {
        alert('Deleted!');
        this.props.backToList();
      })
      .catch(err => {
        alert(err.response.data);
      });
  }

  render() {
    return (
      <div>
        <div className="btn-group" role="group" aria-label="Basic example">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.props.backToList}>
          Back to List
        </button>
        <button
          type="button"
          className="btn btn-danger"
          data-toggle="modal"
          data-target="#deleteIngredientModal"
        >Delete</button>
        </div>
        <div className="modal fade" id="deleteIngredientModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this ingredient?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DeleteIngredientButton.propTypes = {
  id: PropTypes.number,
  backToList: PropTypes.func,
};

export default DeleteIngredientButton;
