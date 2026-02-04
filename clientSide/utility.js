import { state } from "./client.js";
import { get_formEl, get_loginBtn, get_loginFormHeader, get_loginLink, get_loginServerNotice, get_requestsContainer, get_signInFormEl, get_signupBtn, get_signupLink } from "./dom.js";
import { getSingleVidReq } from "./videoReqTemp.js";

// fetch requests
// grabs state parameters (searchTerm, filterBy) and fetches the data from db
// the server then returns the requests that pass the searchTerm & status-filter
// and sorts them by the sortBy parameter (new first, top voted)
async function getAllVidReqs() {
  const response = await fetch(`http://localhost:4000/video-request`);
  return await response.json();
}

// // render sorted requests takes sortBy and searchTerm as parameters, makes the api call
// // the renderList fn is what calls the render function to render the fetched requests
// async function renderSortedVidReqs(sortBy, searchTerm, filterBy = "all") {
//   const sortedRequests = await getAllVidReqs(sortBy, searchTerm, filterBy);
//   renderList(sortedRequests, state.user.role);
// }

// render requests
// takes an array of the requests to render, and the role of the user since admin extra controls and user gets request submission form
function renderList(list, role = state.user.role) {
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
  // getAllSortedVidReqs
  state.requestsList = await getAllVidReqs();
  const filteredRequestsData = clientSideDataHandling(state.sortBy, state.searchTerm, state.filterBy);
  renderList(filteredRequestsData, user.role);
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
  location.hash = "";
  location.hash = path;
}

// update video link function
// make request to update the videoRef.link value of a request
async function updateVideoRefLink(requestId, videoRefValue) {
  const response = await fetch(`http://localhost:4000/video-request/videoRef/${requestId}`, {
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
    body: JSON.stringify({ link: videoRefValue }),
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
  const landingFormHeader = get_loginFormHeader();

  // show other button
  loginBtn.classList.add("d-none");
  signupBtn.classList.remove("d-none");
  // show other link
  signupLink.classList.add("d-none");
  loginLink.classList.remove("d-none");
  // form action
  // signInFormEl.setAttribute("action", "http://localhost:4000/user/signup");
  // update header
  landingFormHeader.innerHTML = "Create an account";
}
function swapSignupToLogin() {
  // DOM elements
  const loginBtn = get_loginBtn();
  const signInFormEl = get_signInFormEl();
  const signupBtn = get_signupBtn();
  const signupLink = get_signupLink();
  const loginLink = get_loginLink();
  const landingFormHeader = get_loginFormHeader();

  // show other button
  loginBtn.classList.remove("d-none");
  signupBtn.classList.add("d-none");
  // show other link
  loginLink.classList.add("d-none");
  signupLink.classList.remove("d-none");
  // form action
  // signInFormEl.setAttribute("action", "http://localhost:4000/user/login");
  // update header
  landingFormHeader.innerHTML = "Welcome back";
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
const debounceSearch = debounce(async (sortType, searchTerm, filterBy) => {
  // we will need to replace this with a client-side sorting and then client-side rendering
  // await renderSortedVidReqs(sortType, searchTerm, filterBy);
  const sortedVidReqs = clientSideDataHandling(sortType, searchTerm, filterBy);
  renderList(sortedVidReqs);
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
// return applied mode dark/light
function getTheme() {
  return document.documentElement.getAttribute("data-bs-theme");
}
// runs on initial load detects user preferred color mode and sets the theme to match it
function autodetectColorTheme() {
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
// switches dark/light theme
function toggleTheme() {
  if (document.documentElement.getAttribute("data-bs-theme") === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else if (document.documentElement.getAttribute("data-bs-theme") === "light") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}
// this update the icon of the them toggle button to match the opposite of the currently applied mode
function updateThemeIcon(icon) {
  const theme = getTheme();
  if (theme === "dark") {
    icon.textContent = "light_mode";
  } else {
    icon.textContent = "dark_mode";
  }
}

// logout function
async function logout() {
  console.log("logout client");
  // clear JWT cookie
  await fetch("http://localhost:4000/user/logout", {
    method: "POST",
  });
  // clear state
  state.user = "";
  state.userId = "";
  // navigate to home
  navigate("/");
}

// this runs when client side checks pass but the user is not found in the db
function loginServerFail() {
  // DOM elements
  const notFoundNotice = get_loginServerNotice();
  const loginInputFields = get_signInFormEl().querySelectorAll("input");
  // add eventlisteners
  loginInputFields.forEach((input) => {
    input.classList.add("border-danger");

    input.addEventListener("input", (e) => {
      loginInputFields.forEach((element) => {
        notFoundNotice.classList.add("d-none");
        element.classList.remove("border-danger");
      });
    });
  });
  notFoundNotice.classList.remove("d-none");
  notFoundNotice.innerText = `Could not find that user. try again`;
}

// this function will give a client-side option for sorting, filtering & searching
function clientSideDataHandling(sortBy, searchTerm, filterBy) {
  let requestsData = state.requestsList;
  // 1. searching
  if (searchTerm) {
    requestsData = requestsData.filter((request) => request.topic_title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  // 2. filtering
  if (filterBy !== "all") {
    requestsData = requestsData.filter((request) => request.status === filterBy);
  }
  // 3. sorting
  if (sortBy === "New First") {
    requestsData = requestsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === "Top Voted First") {
    requestsData = requestsData.sort((a, b) => b.votes["ups"].length - b.votes["downs"].length - (a.votes["ups"].length - a.votes["downs"].length));
  }
  return requestsData;
}

function navbar_appContainer_Elms() {
  // get color theme
  const themeMode = getTheme();
  const navbar_appContainer = document.createElement("div");
  navbar_appContainer.className = "container-fluid py-1 d-flex flex-column justify-content-center";
  navbar_appContainer.innerHTML = `    
  <nav class="navbar bg-body mx-3 mt-2">
        <div id="toggleTheme" class="btn d-flex align-itmes-center">
            <span class="material-icons-outlined" style="pointer-events:none">${themeMode === "dark" ? "light_mode" : "dark_mode"}</span>
        </div>
        <button id="logoutBtn" type="button" class="btn btn-outline-danger">Logout</button>
  </nav>
  <div id="app_container" class="app-Content">`;

  app.appendChild(navbar_appContainer);

  // theme button event listener
  const themeBtn = document.getElementById("toggleTheme");
  themeBtn.addEventListener("click", (e) => {
    toggleTheme();
    updateThemeIcon(e.target.querySelector("span.material-icons-outlined"));
  });
  // logout event listener
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", (e) => {
    logout();
  });
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
  getAllVidReqs,
  debounceSearch,
  createPopup,
  getThumbnail,
  autodetectColorTheme,
  getTheme,
  toggleTheme,
  updateThemeIcon,
  logout,
  loginServerFail,
  clientSideDataHandling,
  navbar_appContainer_Elms,
};
