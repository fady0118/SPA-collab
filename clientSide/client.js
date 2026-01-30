import { signInRequest, sendVidRequest } from "./userFunctions.js";
import { checkUserId, debounceSearch, displayDashboard, getSortedVidReqs, renderList, renderSortedVidReqs, swapLoginToSignup, swapSignupToLogin } from "./utility.js";
// Global states and elements
export const state = {
  userId: "",
  user: "",
  requestsList:[],
  sortBy: "New First",
  searchTerm: undefined,
  filterBy:"all",
};
// Dom Elements
export const formEl = document.getElementById("requestForm");
export const signInFormEl = document.getElementById("loginForm");
export const requestsContainer = document.getElementById("listOfRequests");
export const loginBtn = signInFormEl.querySelector("#loginBtn");
export const signupBtn = signInFormEl.querySelector("#signupBtn");
export const signupLink = signInFormEl.querySelector("#login2Register");
export const loginLink = signInFormEl.querySelector("#Register2login");

document.addEventListener("DOMContentLoaded", async function () {
  // add form eventlisteners
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendVidRequest();
  });
  signInFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    signInRequest();
  });

  // check if the url contains an id then authenticate it and move to user dashboard or return
  if (window.location.search) {
    const userId = new URLSearchParams(window.location.search).get("id");
    if (!userId) {
      return;
    }
    state.userId = userId;
    // check that the id belongs to a user
    const response = await checkUserId(state.userId);
    if (!response.ok) {
      return;
    }
    const user = await response.json(); // parse the response
    // update the state to use later in requests
    state.user = user;
    await displayDashboard(state.user);
    // transition from login form to dashboard page
    document.getElementById("loginFormContainer").classList.add("d-none");
    document.getElementById("app_container").classList.remove("d-none");
  }

  // swap login & signup
  // this is for the login/register form a button changes the form action and the button text from login to register and viceversa
  // login expects that you are already a user so it submits the formdata to the login server endpoint
  // register expects that you are not a user so it submits the formdata to the register new user server endpoint
  signupLink.addEventListener("click", (e) => {
    swapLoginToSignup();
  });
  loginLink.addEventListener("click", (e) => {
    swapSignupToLogin();
  });


  // data utilities (sort, search, filter)
  // button elements for all 3
  const sortingElms = document.querySelectorAll(".sort_by");
  const searchElm = document.getElementById("searchBox");
  const filterElms = document.querySelectorAll(".filter_by");
  // SORTING
  sortingElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      e.preventDefault();
      state.sortBy = e.target.value;
      await renderSortedVidReqs(state.sortBy, state.searchTerm, state.filterBy);
      sortingElms.forEach((element) => {
        element.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });

  // SEARCHING
  // the search field calls the search function on user input
  // to prevent frequest api calls on each letter we use debounceSearch which delays the api call by 500ms
  // if the user enters another input in that 500ms period the previous api call won't trigger
  searchElm.addEventListener("input", async (e) => {
    state.searchTerm = e.target.value;
    debounceSearch(state.sortBy, state.searchTerm);
  });
  // a clear button that resets the searchbox as well as the requests list by making an empty search
  document.getElementById("clearSearchBox").addEventListener("click", (e) => {
    searchElm.value = "";
    state.searchTerm = undefined;
    debounceSearch(state.sortBy, state.searchTerm);
  });

  // FILTERING
  filterElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      // update state
      if (e.target.value.toLowerCase() === state.filterBy) {
        return;
      } else {
        // filteredList = sortedRequestsList.filter((request) => request.status.toLowerCase() === e.target.value.toLowerCase());
        state.filterBy = e.target.value.toLowerCase();
      }
      // update requestsList
      // filtering and rendering
      const filteredRequestsList = await getSortedVidReqs(state.sortBy, state.searchTerm, state.filterBy);
      renderList(filteredRequestsList, state.user.role);
      // styling buttons
      filterElms.forEach((elm) => {
        elm.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });
});
