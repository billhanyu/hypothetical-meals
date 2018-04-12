import React, { Component } from 'react';
import PropTypes from 'prop-types';

let noCollapseButton = false;

class SaleItem extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    $('.collapse').unbind().on('show.bs.collapse', function (e) {
      if (noCollapseButton) {
        e.preventDefault();
        noCollapseButton = false;
      }
    });
    $('.no-collapse').unbind().on('click', function (e) {
      noCollapseButton = true;
    });
  }

  render() {
    const { columnClass, sale } = this.props;
    return (
      <tbody>
        <tr data-toggle="collapse" data-target={`#sale_${this.props.idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}></td>
          <td className={columnClass}></td>
          <td className={columnClass}></td>
          {
            global.user_group !== 'noob' &&
            <td className={columnClass}></td>
          }
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={2} className="hiddenRow">
            <div id={`sale_${this.props.idx}`} className="accordian-body collapse">
            </div>
          </td>
          {global.user_group !== 'noob' && <td colSpan={1} className="hiddenRow"></td>}
        </tr>
      </tbody>
    );
  }
}

SaleItem.propTypes = {
  columnClass: PropTypes.string,
  sale: PropTypes.object,
  idx: PropTypes.number,
};

export default SaleItem;
