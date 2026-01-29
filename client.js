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

  // this function is to authenticate the userId from the URl 
  async function checkUserId(userId) {
    return await fetch("http://localhost:4000/user/checkId", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  }
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

  // fetch requests from database and then render them in the dashboard element
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
  // takes an array of the requests to render, and the role of the user since admin extra controls and user gets request submission form
  function renderList(list, role="user") {
    requestsContainer.innerHTML = "";
    list.forEach((request) => {
      const vidRequestEl = getSingleVidReq(request, role);
      requestsContainer.appendChild(vidRequestEl);
    });
  }
  // SUBMITTING FORM
  // client side sign in form validation if this detects errors in name or email it will display error messages
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
  // client side checks for request submission validity
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
  // form handlers to handle signIn and request submit forms
  // sign in form takes login form data checks its validity then submits to the backend endpoint or rejects
  function signInRequest() {
    const formData = new FormData(singInformEl);
    console.log(formData);
    const validationErrors = checkSignInFormValidity(formData);
    if (validationErrors) {
      return;
    }
    singInformEl.submit();
  }
  // request submit form takes form data checks its validity then submits to the backend endpoint or rejects
  // if the request is accepted by client and server sides the created request is then pushed to the request list that is used to render the requests
  // instead of rerendering the entire list we will render the new request only 
  // the new request is generated using the singleVidReq function and then added to the dom
  // we use prepend instead of appendChild since the desired order is newFirst
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
      requestsList.push(data);
      const vidRequestEl = getSingleVidReq(data, state.user.role);
      requestsContainer.prepend(vidRequestEl);
    } catch (error) {
      console.log(error);
    }
  }

  // swap login & signup
  // this is for the login/register form a button changes the form action and the button text from login to register and viceversa
  // login expects that you are already a user so it submits the formdata to the login server endpoint
  // register expects that you are not a user so it submits the formdata to the register new user server endpoint
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
  // grabs request array from db parses it then returns the data
  async function getRequests() {
    const response = await fetch("http://localhost:4000/video-request");
    const vidRequests = await response.json();
    return vidRequests;
  }

  // users can upvote or downvote requests as well as remove their old votes
  // if i user clicks on a vote button this code will send the request id the userId and vote_type (up, down) to the server
  // votes are unique that's why we send the userId so the backend can check the previous vote state
  // the server update vote controller knows how to handle this request and returns the updated request
  async function updateVote(request_id, e) {
    // the button name is the same as the vote_type so we can use it 
    const vote_type = e.target.name;
    try {
      // send the update request 
      const response = await fetch(`http://localhost:4000/video-request/vote/${request_id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({ vote_type: vote_type, userId: state.userId }),
      });
      const data = await response.json();

      // get both vote buttons of the current element
      const upvoteBtn = e.target.parentElement.children.ups;
      const downvoteBtn = e.target.parentElement.children.downs;
      // style the buttons so the user can the current state of their voting (upvote, downvote, none)
      // the class is definded in the html it changes the buttons colors 
      data.newRequest.votes[upvoteBtn.name].includes(state.userId) ? upvoteBtn.classList.add("voteBtnStyle") : upvoteBtn.classList.remove("voteBtnStyle");
      data.newRequest.votes[downvoteBtn.name].includes(state.userId) ? downvoteBtn.classList.add("voteBtnStyle") : downvoteBtn.classList.remove("voteBtnStyle");
      // we calculate the net votes to display the score of each request 
      const voteScoreEl = e.target.parentElement.querySelector(".voteScore"); // grab the element
      const voteScore = data.newRequest.votes["ups"].length - data.newRequest.votes["downs"].length; // calculate the score
      voteScoreEl.textContent = voteScore; // update the score in the dom
    } catch (error) {
      console.log(error);
    }
  }
  
  // create video request element with all its functionality
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
                    <div class="d-flex justify-content-center w-75">
                      <div class="videoRefInput d-none w-50 border border-dark rounded border-opacity-50 shadow" style="transition: all ease 0.25s;">
                        <div class="position-relative d-flex align-items-center">
                          <input class="form-control mr-sm-2 bg-transparent"
                              type="text" value="${request.video_ref.link||''}" placeholder="Add Video Link" aria-label="Search">
                          <button type="button" id="videoRefClear"
                              class="d-none bg-dark btn btn-sm clear-btn px-2 ms-2 fs-6 position-absolute top-50 end-0 translate-middle-y"
                              aria-label="Clear search">×</button>
                        </div>
                      </div>
                      <button id="saveVideoRef" class="d-none btn btn-light ms-1">Save</button>
                    </div>
                    <button class="deleteBtn btn btn-danger">Delete</button>
                </div>`:''
              }
                <div class="card-body d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-column order-1" style="width:35%">
                        <h3>${request.topic_title}</h3>
                        <p class="text-muted mb-2">${request.topic_details}</p>
                        <p class="mb-0 text-muted">
                            ${request.expected_result ? `<strong>Expected results:</strong> ${request.expected_result}` : ""}
                        </p>
                    </div>
                    ${request.video_ref.link?`
                        <div id="video_thumbnail" class="bg-light rounded position-relative order-2" style="aspect-ratio: 16/9;width: 15%;">
                          <a class="d-block w-100 h-100 " href="${request.video_ref.link}" target="_blank"></a>
                          <span class="material-symbols-outlined position-absolute top-50 start-50 translate-middle z-1 fs-1">play_circle</span>
                        </div>`
                      :''
                    }
                    <div class="d-flex align-items-center order-3">
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

    // populate requestEl with the template
    const requestEl = document.createElement("div");
    requestEl.className+="video-request d-flex flex-row align-items-center";
    requestEl.innerHTML = vidRequestTemplate;

    // add event listeners to vote buttons
    const voteButtons = requestEl.querySelectorAll("[class^='btn upvote-btn']");
    voteButtons.forEach((voteBtn) => {
      voteBtn.addEventListener("click", (e) => {
        updateVote(request._id, e);
      });
    });

    // fetch and add thumbnail to requests with video links
    if(request.video_ref.link!==""){
      const videoMatch = request.video_ref.link.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
      if(videoMatch!==null){
        const video_Id = videoMatch[1];
        const thumbnail = `https://img.youtube.com/vi/${video_Id}/hqdefault.jpg`;
        requestEl.querySelector("#video_thumbnail").style.backgroundImage =`url(${thumbnail})`;
        requestEl.querySelector("#video_thumbnail").style.backgroundSize = "cover";
        requestEl.querySelector("#video_thumbnail").style.backgroundPosition = "center";
      }
    }
    
    // admin header elements
    if(state.user.role==="super user"){
      // videoRef Input on initial request render 
      if (request.status === "done" && state.user.role==="super user") {
        // show the input field to add the video ref link
        requestEl.querySelector("[class^='videoRefInput']").classList.remove("d-none");
        requestEl.querySelector("#saveVideoRef").classList.remove("d-none");
      }
      // delete button
      const deleteBtn = requestEl.querySelector("[class^='deleteBtn']");
      deleteBtn.addEventListener("click", (e)=>{
          deleteRequest(request)
      })

      // status droplist
      const reqStatusListEl = requestEl.querySelector("[class^='reqStatusList']")
      let oldStatus;
      reqStatusListEl.addEventListener("focus", (e)=>{
        oldStatus = e.target.value;
      })
      reqStatusListEl.addEventListener("change", (e)=>{
        const newStatus = e.target.value;
        // confirm status change popup
        const statusChangePopup = document.createElement('div');
        statusChangePopup.className ='card text-center position-absolute top-50 start-50 translate-middle z-1 p-3';
        statusChangePopup.innerHTML = `<div class="card-body">
          <p class="text-capitalize">you are changing <strong class="text-primary">${request.topic_title}</strong> status to <strong class="text-primary">${e.target.value}</strong></p>
          <div>
            <button type="button" class="popup-confirm btn btn-outline-success mx-1">Confirm</button>
            <button type="button" class="popup-cancel btn btn-outline-secondary mx-1">Cancel</button>
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
            updatedStatusRequest = await response.json();
            
            // we need to clear the video link if the status is changed from done to planned/new
            if(newStatus!=="done"){
              await updateVideoRefLink("")
            }
            // update using showdashboard which fetches the data and calls renderlist
            await displayDashboard(state.user)
            document.querySelector(".filter_by[value='All']").click();
          } else {
            // reset dropList
            requestEl.querySelector("select.reqStatusList").value = oldStatus; // find old value
            
          }
          statusChangePopup.remove();
          if(!updatedStatusRequest){
            return;
          }
        }
        popupBtns.forEach(btn=>{btn.addEventListener("click",async (e)=>{
            await popupHandle(e, newStatus);
        })})
      }) 

      // video reference link field
      const videoRefEl = requestEl.querySelector("[class^='videoRefInput']");
      // expand on focusIN
      videoRefEl.parentElement.addEventListener("focusin", ()=>{
        videoRefEl.classList.add("w-75")
        videoRefEl.classList.remove("w-50")
        const videoClearBtn = videoRefEl.querySelector('#videoRefClear');
        videoClearBtn.classList.remove("d-none");
      })
      // collapse on focusOUT
      videoRefEl.parentElement.addEventListener("focusout", ()=>{
        videoRefEl.classList.remove("w-75")
        videoRefEl.classList.add("w-50")
        videoRefEl.querySelector('#videoRefClear').classList.add("d-none")
      }) 
      // clear input using clear button
      videoRefEl.querySelector('#videoRefClear').addEventListener("click", ()=>{
        videoRefEl.querySelector("input[type='text']").value="";
      })
      // video reference link Save button
      const linkSaveBtn = videoRefEl.parentElement.querySelector("#saveVideoRef");
      
      // update video link function
      async function updateVideoRefLink(videoRefValue){
        const response = await fetch(`http://localhost:4000/video-request/videoRef/${request._id}`, {
          headers:{"Content-Type":"application/json"},
          method:"PATCH",
          body:JSON.stringify({userId:state.userId, link:videoRefValue})
        })
        return await response.json();
      }
      linkSaveBtn.addEventListener("click", async ()=>{

        const videoRefValue = videoRefEl.querySelector("input[type='text']").value;
        const videoRefLinkValue = await updateVideoRefLink(videoRefValue);

        // update video link and thumbnail
        if(videoRefLinkValue.video_link!==""){
          const video_Id = videoRefLinkValue.video_link.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/)[1];
          const thumbnail = `https://img.youtube.com/vi/${video_Id}/hqdefault.jpg`;
          // in case the video thumbnail element doesn't exist (first time) we'll need to create it
          if(!requestEl.querySelector("#video_thumbnail>a")){
            console.log("creating thumbnail element");
            const thumbnailDIV = document.createElement('div');
            thumbnailDIV.id = "video_thumbnail"
            thumbnailDIV.classList = "bg-light rounded position-relative order-2"
            thumbnailDIV.setAttribute("style","aspect-ratio: 16/9;width: 15%;")
            thumbnailDIV.innerHTML= `<a class="d-block w-100 h-100 " target="_blank"></a>
            <span class="material-symbols-outlined position-absolute top-50 start-50 translate-middle z-1 fs-1">play_circle</span>
            `
            requestEl.querySelector("div.card-body").appendChild(thumbnailDIV);
          }
          requestEl.querySelector("#video_thumbnail>a").setAttribute("href",videoRefLinkValue.video_link)
          requestEl.querySelector("#video_thumbnail").style.backgroundImage =`url(${thumbnail})`;
          requestEl.querySelector("#video_thumbnail").style.backgroundSize = "cover";
          requestEl.querySelector("#video_thumbnail").style.backgroundPosition = "center";
        }

        
        // update requestsList
        requestsList = await getRequests();
      })
    }
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
  const filterElms = document.querySelectorAll(".filter_by");
  sortingElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      e.preventDefault();
      state.sortBy = e.target.value;
      await renderSortedVidReqs(state.sortBy, state.searchTerm);
      sortingElms.forEach((element) => {
        element.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });
  // SEARCHING
  searchElm.addEventListener("input", async (e) => {
    state.searchTerm = e.target.value;
    debounceSearch(state.sortBy, state.searchTerm);
  });
  // searchElm.addEventListener("keydown", (e) => {
  //   if (e.key === "Enter") {
  //     state.searchTerm = e.target.value;
  //     debounceSearch(state.sortBy, state.searchTerm);
  //   }
  // });
  document.getElementById("clearSearchBox").addEventListener("click", (e) => {
    searchElm.value = "";
    state.searchTerm = undefined;
    debounceSearch(state.sortBy, state.searchTerm);
  });
  // FILTERING
  filterElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      // update requestsList
      const sortedRequestsList = await getSortedVidReqs(state.sortBy, state.searchTerm);
      // filtering and rendering
      let filteredList;
      if (e.target.value.toLowerCase() === "all") {
        filteredList = sortedRequestsList;
      } else {
        filteredList = sortedRequestsList.filter((request) => request.status.toLowerCase() === e.target.value.toLowerCase());
      }
      renderList(filteredList, state.user.role);
      // styling
      filterElms.forEach((elm) => {
        elm.classList.remove("active");});
      e.target.classList.add("active");
    });
  });

  // getVidReqs
  async function getSortedVidReqs(sortBy, searchTerm){
    const searchTermQuery = searchTerm ? `&topic_title=${searchTerm}` : "";
    const response = await fetch(`http://localhost:4000/video-request?sortBy=${sortBy}${searchTermQuery}`);
    return await response.json();
  }
  async function renderSortedVidReqs(sortBy = "New First", searchTerm = undefined) {
    const sortedRequests = await getSortedVidReqs(sortBy, searchTerm);
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
    await renderSortedVidReqs(sortType, searchTerm);
  }, 500);
});
