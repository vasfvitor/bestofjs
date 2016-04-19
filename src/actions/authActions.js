// auth0 actions
// 3 exported functions:
// - start()
// - login()
// - logout()

const APP_URL = 'https://bestofjs.auth0.com';

const LOCAL_KEYS = ['id', 'access']
  .map(key => `bestofjs_${key}_token`);

// Check if the user is logged in when the application starts
// called from <App> componentDidMount()
export function start() {
  return dispatch => {
    loginRequest();
    return getToken()
      .then(token => {
        getProfile(token.id_token)
          .then(profile => {
            // console.info('profile', profile);
            if (profile) {
              return dispatch(loginSuccess(profile, token.id_token));
            } else {
              return dispatch(loginFailure());
            }
          })
          .catch(() => {
            // console.info('Login failure1');
            return dispatch(loginFailure());
          });
      })
      .catch(() => {
        // console.info('Login failure2');
        return dispatch(loginFailure());
      });
  };
}

// `login` action callded from the login button
export function login() {
  const client_id = 'MJjUkmsoTaPHvp7sQOUjyFYOm2iI3chx';
  const redirect_uri = `${self.location.origin}%2Fauth0.html`;
  const auth0Client = 'eyJuYW1lIjoiYXV0aDAuanMiLCJ2ZXJzaW9uIjoiNi44LjAifQ';
  const url = `${APP_URL}/authorize?scope=openid&response_type=token&connection=github&sso=true&client_id=${client_id}&redirect_uri=${redirect_uri}&auth0Client=${auth0Client}`;
  return dispatch => {
    dispatch(loginRequest());
    self.location.href = url;
  };
}

// Return user's `id_token` (JWT) checking from localStorage:
function getToken() {
  const [id_token, access_token] = LOCAL_KEYS.map(
    key => window.localStorage[key]
  );
  if (id_token) {
    return Promise.resolve({
      id_token,
      access_token
    });
  }
  return Promise.reject('');
}

// Return UserProfile for a given `id_token`
function getProfile(token) {
  if (!token) return Promise.reject('Token is missing!');
  // console.info('Auth0 API call with token', token.length);
  const body = {
    id_token: token
  };
  const options = {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  const url = `${APP_URL}/tokeninfo`;
  return fetch(url, options)
    .then(response => checkStatus(response))
    .then(response => response.json())
    .then(json => json.nickname);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

export function loginRequest() {
  return {
    type: 'LOGIN_REQUEST'
  };
}
function loginSuccess(username, token) {
  return {
    type: 'LOGIN_SUCCESS',
    username,
    token
  };
}
function loginFailure(username) {
  resetToken();
  return {
    type: 'LOGIN_FAILURE',
    username
  };
}

export function fakeLogin() {
  return dispatch => {
    dispatch(loginRequest());
    const p = new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ username: 'mike' });
      }, 1000);
    });
    return p
      .then(json => dispatch(loginSuccess(json.username)));
  };
}

// LOGOUT
function logoutRequest() {
  return {
    type: 'LOGOUT_REQUEST'
  };
}
function logoutSuccess() {
  return {
    type: 'LOGOUT_SUCCESS'
  };
}

// logout button
export function logout() {
  return dispatch => {
    dispatch(logoutRequest());
    const p = new Promise(function (resolve) {
      // Do not call window.auth0.logout() that will redirect to Github signout page
      resetToken();
      resolve();
    });
    return p
      .then(() => dispatch(logoutSuccess()));
  };
}

function resetToken() {
  LOCAL_KEYS.forEach(key => window.localStorage.removeItem(key));
}
