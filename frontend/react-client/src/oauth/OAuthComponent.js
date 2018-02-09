import React, { Component } from 'react';
import qs from 'querystring';
import axios from 'axios';
import { client_id } from './OAuth';
const IDENTITY_API_URL = 'https://api.colab.duke.edu/identity/v1/';

class OAuthComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const params = qs.parse(window.location.hash.substring(1));
    const token = params.access_token;
    axios.get(IDENTITY_API_URL, {
      headers: {
        'x-api-key': client_id,
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => console.log(response.data))
    .catch(err => console.log(err));
  }

  render() {
    return <h1>OAuth</h1>;
  }
}

export default OAuthComponent;
