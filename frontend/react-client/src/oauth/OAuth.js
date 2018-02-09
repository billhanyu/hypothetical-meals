import qs from 'querystring';
import getConfig from '../../../../server/getConfig';
const config = getConfig();

const AUTHORIZE_URL = 'https://oauth.oit.duke.edu/oauth/authorize.php';

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

export const client_id = config.oauth.client_id;

export function getAuthorizeLink() {
  return `${AUTHORIZE_URL}?${qs.stringify(getAuthorizeParams())}`;
}
