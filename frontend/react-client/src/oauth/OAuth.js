import qs from 'querystring';
import getConfig from '../../../../server/getConfig';
const config = getConfig();

const AUTHORIZE_URL = 'https://oauth.oit.duke.edu/oauth/authorize.php';
// const TOKEN_URL = 'https://oauth.oit.duke.edu/oauth/token.php';

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
