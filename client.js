document.addEventListener("DOMContentLoaded", async function () {
  const formEl = document.getElementById("requestForm");
  const singInformEl = document.getElementById("loginForm");
  const requestsContainer = document.getElementById("listOfRequests");
  // add form eventlisteners
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendVidRequest();
  });
  singInformEl.addEventListener("submit", (e) => {
    e.preventDefault();
    signInRequest();
  });
  let requestsList;
  const state = {
    sortBy: "New First",
    searchTerm: undefined,
    userId: "",
    user:"",
  };
  async function checkUserId(userId) {
    return await fetch("http://localhost:4000/user/checkId", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  }
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
    const user = await response.json();
    state.user = user;
    await displayDashboard(state.user);

    document.getElementById("loginFormContainer").classList.add("d-none");
    document.getElementById("app_container").classList.remove("d-none");
  }
  // display requests
  async function displayDashboard(user) {
    if(user===""){
      return
    }
    // display admin-user common stuff
    requestsList = await getRequests();
    renderList(requestsList, user.role);
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
  // render requests
  function renderList(list, role="user") {
    requestsContainer.innerHTML = "";
    list.forEach((request) => {
      const vidRequestEl = getSingleVidReq(request, role);
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
    formData.append("userId", state.userId);
    const validationErrors = checkTopicFormValidity(formData);
    if (validationErrors) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/video-request`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(data)
      requestsList.push(data);
      const vidRequestEl = getSingleVidReq(data, state.user.role);
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

  async function updateVote(request_id, e) {
    const vote_type = e.target.name;
    try {
      const response = await fetch(`http://localhost:4000/video-request/vote/${request_id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({ vote_type: vote_type, userId: state.userId }),
      });
      const data = await response.json();

      const upvoteBtn = e.target.parentElement.children.ups;
      const downvoteBtn = e.target.parentElement.children.downs;
      data.newRequest.votes[upvoteBtn.name].includes(state.userId) ? upvoteBtn.classList.add("voteBtnStyle") : upvoteBtn.classList.remove("voteBtnStyle");
      data.newRequest.votes[downvoteBtn.name].includes(state.userId) ? downvoteBtn.classList.add("voteBtnStyle") : downvoteBtn.classList.remove("voteBtnStyle");

      const voteScoreEl = e.target.parentElement.querySelector(".voteScore");
      const voteScore = data.newRequest.votes["ups"].length - data.newRequest.votes["downs"].length;
      voteScoreEl.textContent = voteScore;

      // const index = requestsList.findIndex((reqItem) => reqItem._id === data.newRequest._id);
      // requestsList[index].votes = data.newRequest.votes;
    } catch (error) {
      console.log(error);
    }
  }

  function getSingleVidReq(request, role="user") {
    let date = new Date(request.createdAt);
    const dateFormat = `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getFullYear()}`;
    const statusArray = ["new", "planned", "done"];
    const vidRequestTemplate = `
    <div class="card mb-3 flex-fill">
              ${role==="super user"?`
                <div id="super-user-header" class="card-header d-flex justify-content-between">
                    <select class="reqStatusList text-capitalize">
                      ${statusArray.map(stat=>{
                        return `
                          <option class="text-capitalize" value="${stat}" ${stat===request.status?'selected':""}>${stat}</option>
                        `
                      })}
                    </select>


                    <button class="deleteBtn btn btn-danger">Delete</button>
                </div>`:''
              }
                <div class="card-body d-flex justify-content-between flex-row">
                    <div class="d-flex flex-column">
                        <h3>${request.topic_title}</h3>
                        <p class="text-muted mb-2">${request.topic_details}</p>
                        <p class="mb-0 text-muted">
                            ${request.expected_result ? `<strong>Expected results:</strong> ${request.expected_result}` : ""}
                        </p>
                    </div>
                    <div class="d-flex align-items-center">
                      <div class="d-flex flex-column text-center">
                          <a class="btn upvote-btn ${request.votes["ups"].includes(state.userId) ? "voteBtnStyle" : ""}" name="ups">🢁</a>
                          <h3 class="voteScore">${request.votes["ups"].length - request.votes["downs"].length}</h3>
                          <a class="btn downvote-btn ${request.votes["downs"].includes(state.userId) ? "voteBtnStyle" : ""}" name="downs">🢃</a>
                      </div>
                    </div>
                </div>
                <div
                    class="card-footer d-flex flex-row justify-content-between">
                    <div>
                        <span class="request-status text-info">${request.status}</span>
                        &bullet; added by <strong>${request.author.author_name}</strong> on
                        <strong>${dateFormat}</strong>
                    </div>
                    <div
                        class="d-flex justify-content-center flex-column 408ml-auto mr-2">
                        <div class="badge text-bg-info text-dark">
                            ${request.target_level}
                        </div>
                    </div>
                </div>
            </div>
            
            `;

    const requestEl = document.createElement("div");
    requestEl.className+=" video-request d-flex flex-row align-items-center";
    requestEl.innerHTML = vidRequestTemplate;
    const voteButtons = requestEl.querySelectorAll("[class*='-btn']");
    voteButtons.forEach((voteBtn) => {
      voteBtn.addEventListener("click", (e) => {
        updateVote(request._id, e);
      });
    });
    const deleteBtn = requestEl.querySelector("[class^='deleteBtn']");
    if(deleteBtn){
      deleteBtn.addEventListener("click", (e)=>{
        deleteRequest(request)
      })
    }
    const reqStatusListEl = requestEl.querySelector("[class^='reqStatusList']")
    reqStatusListEl.addEventListener("change", (e)=>{
      // console.log('x',e.target.value)
      const newStatus = e.target.value;
      const statusChangePopup = document.createElement('div');
      statusChangePopup.className ='card text-center position-absolute top-50 start-50 translate-middle';
      statusChangePopup.innerHTML = `<div class="card-body">
        <p class="text-capitalize">you are changing <strong class="text-primary">${request.topic_title}</strong> status to <strong class="text-primary">${e.target.value}</strong></p>
        <div>
          <button type="button" class="popup-confirm btn btn-outline-success">Confirm</button>
          <button type="button" class="popup-cancel btn btn-outline-secondary">Cancel</button>
        </div>
        </div>
        `
      document.getElementById("app_container").appendChild(statusChangePopup);
      const popupBtns = statusChangePopup.querySelectorAll("[class^='popup']");
      
      async function popupHandle(e, newStatus){
        const choice = e.target.innerHTML;
        let updatedStatusRequest;
        if(choice==="Confirm"){
          const response = await fetch(`http://localhost:4000/video-request/status/${request._id}`,{   
            headers:{"Content-Type":"application/json"},
            method:"PATCH",
            body: JSON.stringify({
              userId: state.userId,
              status:newStatus
            })
          })
          statusChangePopup.remove();
          updatedStatusRequest = await response.json();
        }
        if(!updatedStatusRequest){
          alert("couldn't update status");
          return;
        }
        const reqStatus = requestEl.querySelector("[class^='request-status']");
        reqStatus.textContent = updatedStatusRequest.status;
        if(updatedStatusRequest.status==="done"){
          // show the input field to add the video ref link
        }
      }
      popupBtns.forEach(btn=>{btn.addEventListener("click",async (e)=>{
          await popupHandle(e, newStatus);
      })})
    })

    // requestEl.querySelector(".upvote-btn").addEventListener("click", (e) => {
    //   updateVote(request._id, e);
    // });
    // requestEl.querySelector(".downvote-btn").addEventListener("click", (e) => {
    //   updateVote(request._id, e);
    // });
    return requestEl;
  }
  // DELETE
  async function deleteRequest(request){
    const response = await fetch(`http://localhost:4000/video-request/${request._id}`, {
      method:"DELETE",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        userId: state.userId,
      })
    });
    const data = await response.json();
    await displayDashboard(state.user);
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
    renderList(sortedRequests,state.user.role);
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
