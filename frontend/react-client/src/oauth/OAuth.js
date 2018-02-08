import qs from 'querystring';
import getConfig from '../../../../server/getConfig';
const config = getConfig();

const AUTHORIZE_URL = 'https://oauth.oit.duke.edu/oauth/authorize.php';
const TOKEN_URL = 'https://oauth.oit.duke.edu/oauth/token.php';

/*
client_id
redirect_uri
response_type[20, 4.1.1]
state Optional; Unique identifier to protect against CSRF[25]
scope Optional; what data your application can access.
*/

function getParams() {
  return {
    'client_id': config.oauth.client_id,
    'client_secret': config.oauth.client_secret,
    'redirect_uri': config.oauth.redirect_uri,
    'response_type': 'code',
    'state': config.oauth.state,
    'scope': 'basic',
  };
}

export default function getAuthorizeLink() {
  return `${AUTHORIZE_URL}?${qs.stringify(getParams())}`;
}
