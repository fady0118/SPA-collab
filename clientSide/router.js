// router.js
import Login, { loginViewUtils } from "./views/login.js";
import Dashboard, { dashboardViewUtils } from "./views/dashboard.js";
import dataUtils from "./dataUtils.js";
import { state } from "./client.js";
import { displayDashboard } from "./utility.js";


async function renderLogin() {
  app.innerHTML = "";
  app.appendChild(Login());
  // element definitions & event listeners
  loginViewUtils();
}

async function renderDashboard() {
  // render the view
  app.innerHTML = "";
  app.appendChild(Dashboard());
  // element definitions & event listeners
  dataUtils();
  dashboardViewUtils();
  await displayDashboard(state.user)
}

export default async function router() {
  if (!state.userId) {
    await renderLogin();
    return;
  }
  // get the path after #
  const hash = location.hash.slice(1) || "/";
  console.log(hash)
  // const view = routes[hash];
  if (hash === "/") {
    // render the view
    await renderLogin();
  } else if (hash === "/dashboard") {
    // render the view
    await renderDashboard();
  }
}
