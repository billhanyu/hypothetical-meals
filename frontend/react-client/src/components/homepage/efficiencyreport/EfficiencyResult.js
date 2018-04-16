import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs';

class EfficiencyResult extends Component {
  getData(result) {
    const data = {
      labels: [],
      datasets: [
        {
          label: "Utilizations",
          fillColor: "rgba(151,187,205,0.5)",
          strokeColor: "rgba(151,187,205,0.8)",
          highlightFill: "rgba(151,187,205,0.75)",
          highlightStroke: "rgba(151,187,205,1)",
          data: [],
        }
      ],
    };
    let totalTime = 0;
    result.occupancies.forEach(occupancy => {
      let idx = data.labels.indexOf(occupancy.name);
      if (idx < 0) {
        data.labels.push(occupancy.name);
        data.datasets[0].data.push(0),
        idx = data.labels.length - 1;
      }
      const timeMillis = occupancy.end_time
        ? new Date(occupancy.end_time) - new Date(occupancy.start_time)
        : Date.now() - new Date(occupancy.start_time);
      totalTime += timeMillis;
      data.datasets[0].data[idx] += timeMillis;
    });
    data.labels.push('average');
    data.datasets[0].data.push(totalTime / result.total_lines);
    for (let i = 0; i < data.datasets[0].data.length; i++) {
      data.datasets[0].data[i] = Math.round(data.datasets[0].data[i] / 3600000);
    }
    return data;
  }

  render() {
    const data = this.getData(this.props.result);
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
        <h4 className='text-center'>Utilizations of production lines by hours busy</h4>
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
  result: PropTypes.shape({
    occupancies: PropTypes.array.isRequired,
    total_lines: PropTypes.number.isRequired,
    total_time: PropTypes.number.isRequired,
  }).isRequired,
};

export default EfficiencyResult;
