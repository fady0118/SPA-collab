import Login, { loginViewUtils } from "./views/login.js";
import Dashboard, { dashboardViewUtils } from "./views/dashboard.js";
import dataUtils from "./dataUtils.js";
import { state } from "./client.js";
import { displayDashboard } from "./utility.js";

async function renderLogin() {
  console.log('router render login')
  app.innerHTML = "";
  app.appendChild(Login());
  // element definitions & event listeners
  loginViewUtils();
}

async function renderDashboard() {
  console.log('router render dashboard')
  // render the view
  app.innerHTML = "";
  app.appendChild(Dashboard());
  // element definitions & event listeners
  dataUtils();
  dashboardViewUtils();
  await displayDashboard(state.user)
}

export default async function router() {
  // prevent #/dashboard from moving to the dashboard view without logging in
  if (!state.userId) {
    await renderLogin();
    return;
  }
  // get the path after #
  const hash = location.hash.slice(1) || "/";
  // console.log(hash)
  console.log(window.location)
  // const view = routes[hash];
  if (hash === "/") {
    // render the view
    await renderLogin();
  } else if (hash === "/dashboard") {
    // render the view
    await renderDashboard();
  } 
}
