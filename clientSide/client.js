import { signInRequest, sendVidRequest } from "./userFunctions.js";
import { checkUserId, debounceSearch, displayDashboard, getSortedVidReqs, navigate, renderList, renderSortedVidReqs, swapLoginToSignup, swapSignupToLogin } from "./utility.js";
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
window.addEventListener("load", router)
window.addEventListener("hashchange", router)

document.addEventListener("DOMContentLoaded", async function () {
  
  // add form eventlisteners
  // formEl.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   sendVidRequest();
  // });
  // signInFormEl.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   signInRequest();
  // });

  // check if the url contains an id then authenticate it and move to user dashboard or return
  if (window.location.search) {
    const userId = new URLSearchParams(window.location.search).get("id");
    if (!userId) {
      return;
    }
    state.userId = userId;
    // check that the id belongs to a user
    const response = await checkUserId(state.userId);
    console.log({response})
    if (!response.ok) {
      return;
    }
    const user = await response.json(); // parse the response
    // update the state to use later in requests
    state.user = user;
    navigate("/dashboard")
    await displayDashboard(state.user);
        // // transition from login form to dashboard page
        // document.getElementById("loginFormContainer").classList.add("d-none");
        // document.getElementById("app_container").classList.remove("d-none");
  }

  // swap login & signup
  // this is for the login/register form a button changes the form action and the button text from login to register and viceversa
  // login expects that you are already a user so it submits the formdata to the login server endpoint
  // register expects that you are not a user so it submits the formdata to the register new user server endpoint
  // signupLink.addEventListener("click", (e) => {
  //   swapLoginToSignup();
  // });
  // loginLink.addEventListener("click", (e) => {
  //   swapSignupToLogin();
  // });




});
