import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MyApp from './components/App.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
    palette: {
        accent1Color: 'rgb(0, 84, 129)',
        secondary2color: "#005481"
    },
});

ReactDOM.render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <MyApp />
  </MuiThemeProvider>,
  document.getElementById('app'));
