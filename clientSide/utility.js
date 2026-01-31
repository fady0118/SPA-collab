import { state } from "./client.js";
import { get_formEl, get_loginBtn, get_loginLink, get_requestsContainer, get_signInFormEl, get_signupBtn, get_signupLink } from "./dom.js";
import { getSingleVidReq } from "./videoReqTemp.js";

// fetch requests
// grabs state parameters (searchTerm, filterBy) and fetches the data from db
// the server then returns the requests that pass the searchTerm & status-filter
// and sorts them by the sortBy parameter (new first, top voted)
async function getSortedVidReqs(sortBy = state.sortBy, searchTerm = state.searchTerm, filterBy = state.filterBy) {
  const sortByQuery = `sortBy=${sortBy}`;
  const searchTermQuery = searchTerm ? `&topic_title=${searchTerm}` : "";
  const filterByQuery = `&filterBy=${filterBy}`;
  const response = await fetch(`http://localhost:4000/video-request?${sortByQuery}${filterByQuery}${searchTermQuery}`);
  return await response.json();
}

// render sorted requests takes sortBy and searchTerm as parameters, makes the api call
// the renderList fn is what calls the render function to render the fetched requests
async function renderSortedVidReqs(sortBy, searchTerm, filterBy = "all") {
  const sortedRequests = await getSortedVidReqs(sortBy, searchTerm, filterBy);
  renderList(sortedRequests, state.user.role);
}

// render requests
// takes an array of the requests to render, and the role of the user since admin extra controls and user gets request submission form
function renderList(list, role = "user") {
  // DOM elements
  const requestsContainer = get_requestsContainer();
  requestsContainer.innerHTML = "";
  list.forEach((request) => {
    const vidRequestEl = getSingleVidReq(request, role);
    requestsContainer.appendChild(vidRequestEl);
  });
}

// fetch requests from database and then render them in the dashboard element
async function displayDashboard(user) {
  if (user === "") {
    return;
  }
  // display admin-user common stuff
  state.requestsList = await getSortedVidReqs();
  renderList(state.requestsList, user.role);
  const welcomeDashboard = document.getElementById("welcomeDashboard");

  // display admin stuff
  if (user.role === "super user") {
    welcomeDashboard.innerHTML = `
      <h4 class="p-3 text-info-emphasis bg-info-subtle border border-info-subtle rounded-3">
        <strong>Welcome Boss</strong>
      </h4>
      `;

    document.getElementById("requestForm").classList.add("d-none");
  }
  // display user stuff
  else if (user.role === "user") {
    welcomeDashboard.innerHTML = `
      <h4 class="p-3 text-info-emphasis bg-info-subtle border border-info-subtle rounded-3">
        Welcome <strong>${user.author_name}</strong>
      </h4>
        `;
  }
}

// change hash-path
function navigate(path) {
  location.hash = '';
  location.hash = path;
}

// update video link function
// make request to update the videoRef.link value of a request
async function updateVideoRefLink(requestId, userId, videoRefValue) {
  const response = await fetch(`http://localhost:4000/video-request/videoRef/${requestId}`, {
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
    body: JSON.stringify({ userId, link: videoRefValue }),
  });
  return await response.json();
}

// client side sign-in form validation if this detects errors in name or email it will display error messages
function checkSignInFormValidity(formData) {
  // DOM elements
  const signInFormEl = get_signInFormEl();

  const name = formData.get("author_name");
  const email = formData.get("author_email");
  let validationErrors = 0;

  if (!name) {
    // formEl.author_name.nextElementSibling.style.display="block";
    signInFormEl.author_name.classList.add("is-invalid");
    validationErrors++;
  }
  if (!email) {
    signInFormEl.author_email.classList.add("is-invalid");
    validationErrors++;
  }
  const regex_email = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;
  if (email && !email.match(regex_email)) {
    signInFormEl.author_email.classList.add("is-invalid");
    validationErrors++;
  }
  const allInvalidElms = signInFormEl.querySelectorAll(".is-invalid");
  allInvalidElms.forEach((element) => {
    element.addEventListener("input", (e) => {
      e.target.classList.remove("is-invalid");
    });
  });
  return validationErrors;
}

// client side checks for request submission validity
function checkTopicFormValidity(formData) {
  // DOM elements
  const formEl = get_formEl();

  const topic_title = formData.get("topic_title");
  const topic_details = formData.get("topic_details");
  let validationErrors = 0;

  if (!topic_title) {
    formEl.topic_title.classList.add("is-invalid");
    formEl.topic_title.nextElementSibling.nextElementSibling.classList.add("d-none");
    validationErrors++;
  }
  if (topic_title && topic_title.length > 100) {
    formEl.topic_title.classList.add("is-invalid");
    formEl.topic_title.nextElementSibling.classList.add("d-none");
    validationErrors++;
  }
  if (!topic_details) {
    formEl.topic_details.classList.add("is-invalid");
    validationErrors++;
  }

  const allInvalidElms = formEl.querySelectorAll(".is-invalid");
  allInvalidElms.forEach((element) => {
    element.addEventListener("input", (e) => {
      e.target.classList.remove("is-invalid");
    });
  });
  return validationErrors;
}

// this function is to authenticate the userId from the URl
async function checkUserId(userId) {
  return await fetch("http://localhost:4000/user/checkId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}
// swap login & signup
// this is for the login/register form a button changes the form action and the button text from login to register and viceversa
// login expects that you are already a user so it submits the formdata to the login server endpoint
// register expects that you are not a user so it submits the formdata to the register new user server endpoint
function swapLoginToSignup() {
  // DOM elements
  const loginBtn = get_loginBtn();
  const signInFormEl = get_signInFormEl();
  const signupBtn = get_signupBtn();
  const signupLink = get_signupLink();
  const loginLink = get_loginLink();

  // show other button
  loginBtn.classList.add("d-none");
  signupBtn.classList.remove("d-none");
  // show other link
  signupLink.classList.add("d-none");
  loginLink.classList.remove("d-none");
  // form action
  signInFormEl.setAttribute("action", "http://localhost:4000/user/signup");
}
function swapSignupToLogin() {
  // DOM elements
  const loginBtn = get_loginBtn();
  const signInFormEl = get_signInFormEl();
  const signupBtn = get_signupBtn();
  const signupLink = get_signupLink();
  const loginLink = get_loginLink();
  // show other button
  loginBtn.classList.remove("d-none");
  signupBtn.classList.add("d-none");
  // show other link
  loginLink.classList.add("d-none");
  signupLink.classList.remove("d-none");
  // form action
  signInFormEl.setAttribute("action", "http://localhost:4000/user/login");
}

// debounce function that delays the execution of a task until the user stops typing for a specified amount of time
// This prevents excessive function calls (like API requests) with every keystroke
function debounce(callback, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}
// debounce search calls the debounce function and passes the render function and a delay of 500ms
// the render function is what handles updating the requests and rendering them
const debounceSearch = debounce(async (sortType, searchTerm) => {
  await renderSortedVidReqs(sortType, searchTerm, state.filterBy);
}, 500);

// create popup Element
function createPopup(method, request, newStatus = "") {
  // create popup element and add classes
  const Popup = document.createElement("div");
  Popup.className = "card text-center position-fixed top-50 start-50 translate-middle z-1 p-3";

  // check if method is update-status or delete
  if (method === "update request status") {
    Popup.innerHTML = `<div class="card-body">
      <p class="text-capitalize">you are changing <strong class="text-primary">${request.topic_title}</strong> status to <strong class="text-primary">${newStatus}</strong></p>
      <div>
        <button type="button" class="popup-confirm btn btn-outline-success mx-1">Confirm</button>
        <button type="button" class="popup-cancel btn btn-outline-secondary mx-1">Cancel</button>
      </div>
      </div>
      `;
  } else if (method === "delete request") {
    Popup.innerHTML = `<div class="card-body">
      <p class="text-capitalize">are you sure you want to delete <strong class="text-primary">${request.topic_title}</strong></p>
      <div>
        <button type="button" class="popup-confirm btn btn-outline-success mx-1">Confirm</button>
        <button type="button" class="popup-cancel btn btn-outline-secondary mx-1">Cancel</button>
      </div>
      </div>
      `;
  }
  // append to app-container element
  document.getElementById("app_container").appendChild(Popup);
  return Popup;
}

// function that takes a yt video link and returns its thumbnail
function getThumbnail(link) {
  // extract video_id from its link
  const videoMatch = link.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
  if (videoMatch !== null) {
    const video_Id = videoMatch[1];
    // get the thumbnail using youtube native method
    const videoTthumbnail = `https://img.youtube.com/vi/${video_Id}/hqdefault.jpg`;
    return videoTthumbnail;
  }
}
// dark/light mode
function getTheme() {
  return document.documentElement.getAttribute("data-bs-theme");
}
function autodetectColorTheme() {
  console.log("autodetectColorTheme");
  const prefersDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const htmlEl = document.documentElement;
  if (prefersDarkMode) {
    // User prefers dark theme
    htmlEl.setAttribute("data-bs-theme", "dark");
  } else {
    // User prefers light theme or no preference is set
    htmlEl.setAttribute("data-bs-theme", "light");
  }
}
function toggleTheme() {
  if (document.documentElement.getAttribute("data-bs-theme") === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else if (document.documentElement.getAttribute("data-bs-theme") === "light") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
  console.log("toggleTheme");
}

export {
  renderList,
  displayDashboard,
  navigate,
  updateVideoRefLink,
  checkSignInFormValidity,
  checkTopicFormValidity,
  checkUserId,
  swapLoginToSignup,
  swapSignupToLogin,
  getSortedVidReqs,
  renderSortedVidReqs,
  debounceSearch,
  createPopup,
  getThumbnail,
  autodetectColorTheme,
  getTheme,
  toggleTheme,
};
