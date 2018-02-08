import React, { Component } from 'react';

class PrimaryOption extends Component {
  constructor(props) {
    super(props);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.state = {
      hovered: false
    };
    /** REQUIRED PROPS:
      1. buttonName (String)
      2. clickHandler (Func)

      OPTIONAL PROPS:
      1. buttonIcon (String for fa icon)
      2. isSelectedButton (boolean)
    */
  }

  onMouseEnter() {
    this.setState({hovered: true});
  }

  onMouseLeave() {
    this.setState({hovered: false});
  }

  render() {
    return (
      <div onClick={() => {this.props.handleClick(this.props.buttonName);}}
         onMouseEnter={this.onMouseEnter}
         onMouseLeave={this.onMouseLeave}
         className={this.state.hovered || this.props.isSelectedButton ? 'primaryoption primaryoptionselected unselectable' : 'primaryoption unselectable'}>
            {this.props.buttonIcon != null ?
              <i className={this.props.buttonIcon} ></i> : null
            }
            <span>
              {this.props.buttonName}
            </span>
      </div>
    );
  }
}

export default PrimaryOption;
