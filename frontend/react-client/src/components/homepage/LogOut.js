export default function logout(cookies, history) {
  cookies.set('user_group', '', { path: '/' });
  cookies.set('token', '', { path: '/' });
  global.user_group = '';
  global.token = '';
  history.push('/');
}
