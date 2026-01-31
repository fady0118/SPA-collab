// client.js
import { autodetectColorTheme, checkUserId, displayDashboard, navigate } from "./utility.js";
import router from "./router.js";
// Global states and elements
export const state = {
  userId: "",
  user: "",
  requestsList:[],
  sortBy: "New First",
  searchTerm: undefined,
  filterBy:"all",
};

// add router event listeners
// window.addEventListener("load", router)
window.addEventListener("hashchange", router)

document.addEventListener("DOMContentLoaded", async function () {
  // set doc mode accodring to user preference
  autodetectColorTheme()
  router();
  // check if the url contains an id then authenticate it and move to user dashboard or return
  if (window.location.search) {
    const userId = new URLSearchParams(window.location.search).get("id");
    if (!userId) return;
    state.userId = userId;
    // check that the id belongs to a user
    const response = await checkUserId(state.userId);
    if (!response.ok) return;
    // history.replaceState({}, "", location.pathname + location.hash);
    // update the state to use later in requests
    state.user = await response.json(); 
    navigate("/dashboard")
  }
});
