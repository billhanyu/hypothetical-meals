import React, { Component } from 'react';
import axios from 'axios';
import EditFormulaBox from './EditFormula/EditFormulaBox.js';
import FormulaWindow from './FormulaWindow.js';

class EditFormula extends Component {
  constructor(props) {
    super(props);
    this.openEditWindow = this.openEditWindow.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.state = {
      isEditingFormula: false,
      EditFormulaBoxes: [],
    };
  }

  componentWillMount() {
    //GET REQUEST HERE
  }

  onDelete(newFormulaObject){
    const {name, desc, quantity, ingredients} = newFormulaObject;
    //DELETE REQUEST HERE
  }

  onUpdate(newFormulaObject){
    const {name, desc, quantity, ingredients} = newFormulaObject;
    //PUT REQUEST HERE
  }

  openEditWindow(newFormulaObject) {
    this.setState({
      isEditingFormula: true,
      activeFormulaObject: newFormulaObject,
    });
  }

  closeEditWindow() {
    this.setState({
      isEditingFormula: false,
    });
  }

  render() {
    return (
      <div className="EditFormulaContainer">
        {
          this.state.isEditingFormula ? <FormulaWindow newFormulaObject={this.state.activeFormulaObject} onFinish={this.onUpdate.bind(this)} BackButtonShown onBackClick={this.closeEditWindow.bind(this)}/> :
          <div>
            <EditFormulaBox onClick={this.openEditWindow} onDelete={this.onDelete} FormulaName="Chicken Soup" />
          </div>
        }

      </div>
    );
  }
}

export default EditFormula;
