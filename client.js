document.addEventListener("DOMContentLoaded", async function () {
  const formEl = document.getElementById("requestForm");
  const singInformEl = document.getElementById("loginForm");
  const requestsContainer = document.getElementById("listOfRequests");
  // add form eventlisteners
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendVidRequest();
  });
  singInformEl.addEventListener("submit", (e)=>{
    e.preventDefault();
    signInRequest();
  })
  let requestsList;
  const state = {
    sortBy:"New First",
    searchTerm:undefined,
    userId:"",
  }
  if (window.location.search) {
    const userId = new URLSearchParams(window.location.search).get("id");
    if (!userId) {
      return;
    }
    await displayDashboard();
    document.getElementById("loginFormContainer").classList.add("d-none");
    document.getElementById("app_container").classList.remove("d-none");
    state.userId = userId;
  }
  // display requests
  async function displayDashboard() {
    requestsList = await getRequests();
    renderList(requestsList);
  }
  // render requests
  function renderList(list) {
    requestsContainer.innerHTML = "";
    list.forEach((request) => {
      const vidRequestEl = getSingleVidReq(request);
      requestsContainer.appendChild(vidRequestEl);
    });
  }
  // SUBMITTING FORM
  // validation
  function checkSignInFormValidity(formData) {
    const name = formData.get("author_name");
    const email = formData.get("author_email");
    let validationErrors = 0;

    if (!name) {
      // formEl.author_name.nextElementSibling.style.display="block";
      singInformEl.author_name.classList.add("is-invalid");
      validationErrors++;
    }
    if (!email) {
      singInformEl.author_email.classList.add("is-invalid");
      validationErrors++;
    }
    const regex_email = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;
    if (email && !email.match(regex_email)) {
      singInformEl.author_email.classList.add("is-invalid");
      validationErrors++;
    }
    const allInvalidElms = singInformEl.querySelectorAll(".is-invalid");
    allInvalidElms.forEach((element) => {
      element.addEventListener("input", (e) => {
        e.target.classList.remove("is-invalid");
      });
    });
    return validationErrors;
  }
  function checkTopicFormValidity(formData) {
    const topic_title = formData.get("topic_title");
    const topic_details = formData.get("topic_details");
    let validationErrors = 0;

    if (!topic_title) {
      formEl.topic_title.classList.add("is-invalid");
      formEl.topic_title.nextElementSibling.nextElementSibling.classList.add("d-none");
      validationErrors++;
    }
    if (topic_title && topic_title.length > 100) {
      console.log(topic_title);
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
  // form handlers
  function signInRequest() {
    const formData = new FormData(singInformEl);
    console.log(formData);
    const validationErrors = checkSignInFormValidity(formData);
    if (validationErrors) {
      return;
    }
    singInformEl.submit();
  }
  async function sendVidRequest() {
    const formData = new FormData(formEl);
    const validationErrors = checkTopicFormValidity(formData);
    if (validationErrors) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/video-request?id=${state.userId||""}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      requestsList.push(data);
      const vidRequestEl = getSingleVidReq(data);
      requestsContainer.prepend(vidRequestEl);
    } catch (error) {
      console.log(error);
    }
  }
  // swap login & signup
  const loginBtn = singInformEl.querySelector("#loginBtn");
  const signupBtn = singInformEl.querySelector("#signupBtn");
  const signupLink = singInformEl.querySelector("#login2Register");
  const loginLink = singInformEl.querySelector("#Register2login");
  signupLink.addEventListener("click", (e) => {
    // show other button
    loginBtn.classList.add("d-none");
    signupBtn.classList.remove("d-none");
    // show other link
    signupLink.classList.add("d-none");
    loginLink.classList.remove("d-none");
    // form action
    singInformEl.setAttribute("action", "http://localhost:4000/user/signup");
  });
  loginLink.addEventListener("click", (e) => {
    // show other button
    loginBtn.classList.remove("d-none");
    signupBtn.classList.add("d-none");
    // show other link
    loginLink.classList.add("d-none");
    signupLink.classList.remove("d-none");
    // form action
    singInformEl.setAttribute("action", "http://localhost:4000/user/login");
  });
  // fetch requests
  async function getRequests() {
    const response = await fetch("http://localhost:4000/video-request");
    const vidRequests = await response.json();
    return vidRequests;
  }

  async function updateVote(vote_type, request_id, e) {
    try {
      const response = await fetch(`http://localhost:4000/video-request/vote/${request_id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({ vote_type: vote_type }),
      });
      const data = await response.json();
      const voteScoreEl = e.target.parentElement.querySelector(".voteScore");
      const voteScore = data.newRequest.votes["ups"] - data.newRequest.votes["downs"];
      voteScoreEl.textContent = voteScore;

      const index = requestsList.findIndex((reqItem) => reqItem._id === data.newRequest._id);
      requestsList[index].votes = data.newRequest.votes;
    } catch (error) {
      console.log(error);
    }
  }

  function getSingleVidReq(request) {
    let date = new Date(request.createdAt);
    const dateFormat = `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getFullYear()}`;
    const vidRequestTemplate = `<div class="card mb-3">
                <div class="card-body d-flex justify-content-between flex-row">
                    <div class="d-flex flex-column">
                        <h3>${request.topic_title}</h3>
                        <p class="text-muted mb-2">${request.topic_details}</p>
                        <p class="mb-0 text-muted">
                            ${request.expected_result ? `<strong>Expected results:</strong> ${request.expected_result}` : ""}
                        </p>
                    </div>
                    <div class="d-flex flex-column text-center">
                        <a class="btn btn-link upvote-btn">🔺</a>
                        <h3 class="voteScore">${request.votes["ups"] - request.votes["downs"]}</h3>
                        <a class="btn btn-link downvote-btn">🔻</a>
                    </div>
                </div>
                <div
                    class="card-footer d-flex flex-row justify-content-between">
                    <div>
                        <span class="text-info">${request.status}</span>
                        &bullet; added by <strong>${request.author_name}</strong> on
                        <strong>${dateFormat}</strong>
                    </div>
                    <div
                        class="d-flex justify-content-center flex-column 408ml-auto mr-2">
                        <div class="badge badge-success">
                            ${request.target_level}
                        </div>
                    </div>
                </div>
            </div>`;

    const requestEl = document.createElement("div");
    requestEl.innerHTML = vidRequestTemplate;
    requestEl.querySelector(".upvote-btn").addEventListener("click", (e) => {
      updateVote("ups", request._id, e);
    });
    requestEl.querySelector(".downvote-btn").addEventListener("click", (e) => {
      updateVote("downs", request._id, e);
    });
    return requestEl;
  }
  // SORTING
  const sortingElms = document.querySelectorAll(".sort_by");
  const searchElm = document.getElementById("searchBox");

  sortingElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      e.preventDefault();
      state.sortBy = e.target.value;
      await getSortedVidReqs(state.sortBy, state.searchTerm);
      sortingElms.forEach((element) => {
        element.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });
  // search
  searchElm.addEventListener("input", async (e) => {
    state.searchTerm = e.target.value;
    debounceSearch(state.sortBy, state.searchTerm);
  });
  searchElm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      state.searchTerm = e.target.value;
      debounceSearch(state.sortBy, state.searchTerm);
    }
  });
  document.getElementById("clearSearchBox").addEventListener("click", (e) => {
    searchElm.value = "";
    state.searchTerm = undefined;
    debounceSearch(state.sortBy, state.searchTerm);
  });

  // getVidReqs
  async function getSortedVidReqs(sortBy = "New First", searchTerm = undefined) {
    const searchTermQuery = searchTerm ? `&topic_title=${searchTerm}` : "";
    const response = await fetch(`http://localhost:4000/video-request?sortBy=${sortBy}${searchTermQuery}`);
    const sortedRequests = await response.json();
    renderList(sortedRequests);
  }
  // debounce
  function debounce(callback, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }
  const debounceSearch = debounce(async (sortType, searchTerm) => {
    await getSortedVidReqs(sortType, searchTerm);
  }, 500);
});
