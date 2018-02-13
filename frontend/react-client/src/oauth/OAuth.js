import qs from 'querystring';
import getConfig from '../../../../server/getConfig';
import axios from 'axios';
const config = getConfig();

const AUTHORIZE_URL = 'https://oauth.oit.duke.edu/oauth/authorize.php';
const IDENTITY_API_URL = 'https://api.colab.duke.edu/identity/v1/';

function getAuthorizeParams() {
  return {
    'client_id': config.oauth.client_id,
    'client_secret': config.oauth.client_secret,
    'redirect_uri': config.oauth.redirect_uri,
    'response_type': 'token',
    'state': config.oauth.state,
    'scope': 'basic',
  };
}

export function getAuthorizeLink() {
  return `${AUTHORIZE_URL}?${qs.stringify(getAuthorizeParams())}`;
}

export function logInWithRedirectedHash(hash, history, cookies) {
  const params = qs.parse(hash.substring(1));
  const token = params.access_token;
  axios.get(IDENTITY_API_URL, {
    headers: {
      'x-api-key': config.oauth.client_id,
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      console.log(response.data);
      const dukeInfo = response.data;
      axios.post('/users/login/oauth', {
        info: {
          netid: dukeInfo.netid,
          name: dukeInfo.displayName,
        }
      })
        .then(response => {
          if (response.status == 200) {
            cookies.set('user_group', response.data.user.user_group, { path: '/' });
            cookies.set('token', response.data.user.token, { path: '/' });
            global.token = response.data.user.token;
            global.user_group = response.data.user.user_group;
            history.push(`/dashboard`);
          }
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => console.log(err));
}
