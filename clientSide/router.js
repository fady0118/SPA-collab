import Login, { loginViewUtils } from "./views/login.js";
import Dashboard, { dashboardViewUtils } from "./views/dashboard.js";
import { get_formEl, get_loginBtn, get_loginLink, get_signInFormEl, get_signupBtn, get_signupLink } from "./dom.js";
import { signInRequest } from "./userFunctions.js";
import dataUtils from "./dataUtils.js";
import { state } from "./client.js";

// const routes = {
//   "/": Login,
//   "/dashboard": Dashboard,
// };

function renderLogin() {
  app.innerHTML = "";
  app.appendChild(Login());
  // element definitions & event listeners
  loginViewUtils();
}
function renderDashboard() {
  // render the view
  app.innerHTML = "";
  app.appendChild(Dashboard());
  // element definitions & event listeners
  dataUtils();
  dashboardViewUtils();
}

export default function router() {
  if (!state.userId) {
    renderLogin();
    return;
  }
  // get the path after #
  const hash = location.hash.slice(1) || "/";
  // const view = routes[hash];
  if (hash === "/") {
    // render the view
    renderLogin();
  } else if (hash === "/dashboard") {
    // render the view
    renderDashboard();
  }
}
