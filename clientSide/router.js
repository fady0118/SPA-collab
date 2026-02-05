import Login, { loginViewUtils } from "./views/login.js";
import Dashboard, { dashboardViewUtils } from "./views/dashboard.js";
import dataUtils from "./dataUtils.js";
import { state } from "./client.js";
import { displayDashboard, headerResizer, navbar_appContainer_Elms } from "./utility.js";
import singleReqPage, { singleReqUtils } from "./views/singleReq.js";

async function renderLogin() {
  app.innerHTML = "";
  app.appendChild(Login());
  // element definitions & event listeners
  loginViewUtils();
}

async function renderDashboard() {
  // render the navbar & app_container
  app.innerHTML = "";
  navbar_appContainer_Elms()
  // render the view
  const app_container = document.getElementById("app_container")
  app_container.innerHTML = "";
  app_container.appendChild(Dashboard());
  // element definitions & event listeners
  dataUtils();
  dashboardViewUtils();
  await displayDashboard(state.user);
  headerResizer()
}

async function renderSingleReq(req_id) {
  // fetch the request data from db
  const response = await fetch(`http://localhost:4000/video-request/${req_id}`);
  const request = await response.json();
  // render the navbar & app_container
  app.innerHTML = "";
  navbar_appContainer_Elms()
  // render the view
  const app_container = document.getElementById("app_container")
  app_container.innerHTML = "";
  app_container.appendChild(singleReqPage(request));
  singleReqUtils(request);
}

export default async function router() {
  // prevent #/dashboard from moving to the dashboard view without logging in
  if (!state.userId) {
    await renderLogin();
    return;
  } 
    // get the path after #
    const hash = location.hash.slice(1) || "/";
    // render view
    if (hash.includes("/req")) {
      await renderSingleReq(hash.split("/")[2]);
    } else {
      await renderDashboard();
    }
}
