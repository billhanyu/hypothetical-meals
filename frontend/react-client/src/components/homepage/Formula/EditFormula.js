import React, { Component } from 'react';
import axios from 'axios';
import EditFormulaBox from './EditFormula/EditFormulaBox.js';
import FormulaWindow from './FormulaWindow.js';
import Snackbar from 'material-ui/Snackbar';

class EditFormula extends Component {
  constructor(props) {
    super(props);
    this.openEditWindow = this.openEditWindow.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.state = {
      isEditingFormula: false,
      EditFormulaBoxes: [],
      FormulaPrefill: null,
      open: false,
      snackbarText: "Finished",
      activeId: null,
    };
  }

  componentWillMount() {
    //GET REQUEST HERE
    axios.get(`/formulas`, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      this.setState({
        EditFormulaBoxes: response.data
      });
    });
  }

  onDelete(formulaID){
    //DELETE REQUEST HERE
    const self = this;
    axios.delete(`/formulas`, {
      headers: {
        Authorization: "Token " + global.token,
        formulaID,
      }
    }).then(response => {
      axios.get(`/formulas`, {
        headers: {Authorization: "Token " + global.token}
      })
      .then(response => {
        self.setState({
          open: true,
          snackbarText: 'Finished Deleting',
          EditFormulaBoxes: response.data,
        });
      });
    }).catch(error => {
      alert("Error deleting Formula");
    });
  }

  onUpdate(newFormulaObject, id){
    const {name, desc, quantity, idToQuantityMap} = newFormulaObject;
    //PUT REQUEST HERE
    const ingredients = [];
    const self = this;
    Object.keys(idToQuantityMap).forEach(key => {
      if(Number(idToQuantityMap[key]) > 0){
        ingredients.push({
          ingredient_id: key,
          num_native_units: idToQuantityMap[key],
        });
      }
    });

    axios.put(`/formulas`, {'formulas':[
      {
          id,
          name,
          description: desc,
          num_product: quantity,
          ingredients,
      }
    ]}, {
      headers: {Authorization: "Token " + global.token}
    }).then(response => {
      axios.get(`/formulas`, {
        headers: {Authorization: "Token " + global.token}
      })
      .then(response => {
        self.setState({
          open: true,
          snackbarText: 'Finished Updating Formula',
          EditFormulaBoxes: response.data,
        });
      });
    }).catch(error => {
      alert("Error updating Formula");
    });
  }

  openEditWindow(FormulaPrefill, activeId) {
    this.setState({
      isEditingFormula: true,
      FormulaPrefill: FormulaPrefill,
      activeId,
    });
  }

  closeEditWindow() {
    this.setState({
      isEditingFormula: false,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div className="EditFormulaContainer">
        <Snackbar
          open={this.state.open}
          message={this.state.snackbarText}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />

        {
          this.state.isEditingFormula ? <FormulaWindow isEditing activeId={this.state.activeId} newFormulaObject={this.state.FormulaPrefill} onFinish={this.onUpdate.bind(this)} BackButtonShown onBackClick={this.closeEditWindow.bind(this)}/> :
          <div>
          {
            this.state.EditFormulaBoxes.map((element, key) => {
              return <EditFormulaBox id={element.id} key={key} onClick={this.openEditWindow} onDelete={this.onDelete} FormulaPrefill={element} />
            })
          }
          </div>
        }

      </div>
    );
  }
}

export default EditFormula;
