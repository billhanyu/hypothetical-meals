import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs';

const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0.5)",
      strokeColor: "rgba(220,220,220,0.8)",
      highlightFill: "rgba(220,220,220,0.75)",
      highlightStroke: "rgba(220,220,220,1)",
      data: [65, 59, 80, 81, 56, 55, 40]
    },
    {
      label: "My Second dataset",
      fillColor: "rgba(151,187,205,0.5)",
      strokeColor: "rgba(151,187,205,0.8)",
      highlightFill: "rgba(151,187,205,0.75)",
      highlightStroke: "rgba(151,187,205,1)",
      data: [28, 48, 40, 19, 86, 27, 90]
    }
  ]
};

class EfficiencyResult extends Component {
  render() {
    return (
      <div>
        <h2>Efficiency Report</h2>
        <div>
          <button
            type='button'
            onClick={this.props.back}
            className='btn btn-secondary'
          >
            Back
          </button>
        </div>
        <div className='row justify-content-md-center'>
          <div className='col-md-10'>
            <Bar data={data} options={{responsive: true}} />
          </div>
        </div>
      </div>
    );
  }
}

EfficiencyResult.propTypes = {
  efficiencies: PropTypes.array,
  back: PropTypes.func,
};

export default EfficiencyResult;
