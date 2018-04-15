import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SaleSpecTable from './SaleSpecTable';

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
    const total = sale.products.reduce((val, product) => val + product.num_packages * product.unit_price, 0);
    return (
      <tbody>
        <tr data-toggle="collapse" data-target={`#sale_${this.props.idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}>{(new Date(sale.created_at)).toString().split(' GMT')[0]}</td>
          <td className={columnClass}>${total}</td>
          <td className={columnClass}>{sale.products.length}</td>
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={2} className="hiddenRow">
            <div id={`sale_${this.props.idx}`} className="accordian-body collapse">
              <SaleSpecTable products={sale.products} />
            </div>
          </td>
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
