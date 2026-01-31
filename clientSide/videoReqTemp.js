import { updateVote } from "./userFunctions.js";
import { deleteRequest, statusChange } from "./adminFunctions.js";
import { getThumbnail, updateVideoRefLink } from "./utility.js";
import { state } from "./client.js";

// create video request element with all its functionality
function getSingleVidReq(request, role = "user") {
  let date = new Date(request.createdAt);
  const dateFormat = `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getFullYear()}`;
  const statusArray = ["new", "planned", "done"];
  const vidRequestTemplate = `
    <div class="card mb-3 flex-fill bg-dark-subtle text-light border border-dark-subtle">
              ${
                role === "super user"
                  ? `
                <div id="super-user-header" class="card-header d-flex justify-content-between">
                    <select class="reqStatusList text-capitalize">
                      ${statusArray.map((stat) => {
                        return `
                          <option class="text-capitalize" value="${stat}" ${stat === request.status ? "selected" : ""}>${stat}</option>
                        `;
                      })}
                    </select>
                    <div class="d-flex justify-content-center w-75">
                      <div class="videoRefInput d-none w-50 border border-dark rounded border-opacity-50 shadow" style="transition: all ease 0.25s;">
                        <div class="position-relative d-flex align-items-center">
                          <input class="form-control mr-sm-2 bg-transparent"
                              type="text" value="${request.video_ref.link || ""}" placeholder="Add Video Link" aria-label="Search">
                          <button type="button" id="videoRefClear"
                              class="d-none bg-dark btn btn-sm clear-btn px-2 ms-2 fs-6 position-absolute top-50 end-0 translate-middle-y"
                              aria-label="Clear search">×</button>
                        </div>
                      </div>
                      <button id="saveVideoRef" class="d-none btn btn-light ms-1">Save</button>
                    </div>
                    <button class="deleteBtn btn btn-danger">Delete</button>
                </div>`
                  : ""
              }
                <div class="card-body d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-column order-1" style="width:35%">
                        <h3>${request.topic_title}</h3>
                        <p class="mb-2">${request.topic_details}</p>
                        <p class="mb-0">
                            ${request.expected_result ? `<strong>Expected results:</strong> ${request.expected_result}` : ""}
                        </p>
                    </div>
                    ${
                      request.video_ref.link
                        ? `
                        <div id="video_thumbnail" class="bg-light rounded position-relative order-2" style="aspect-ratio: 16/9;width: 15%;">
                          <a class="d-block w-100 h-100" href="${request.video_ref.link}" target="_blank"></a>
                          <span class="material-icons-outlined position-absolute top-50 start-50 translate-middle z-1 fs-1" style="pointer-events: none;">play_circle</span>
                        </div>`
                        : ""
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
  requestEl.className += "video-request d-flex flex-row align-items-center";
  requestEl.innerHTML = vidRequestTemplate;

  // add event listeners to vote buttons
  const voteButtons = requestEl.querySelectorAll("[class^='btn upvote-btn'], [class^='btn downvote-btn']");
  voteButtons.forEach((voteBtn) => {
    voteBtn.addEventListener("click", (e) => {
      updateVote(request._id, e);
    });
  });

  // fetch and add thumbnail to requests with video links
  if (request.video_ref.link !== "") {
    const thumbnail = getThumbnail(request.video_ref.link);
      if (thumbnail !== null) {
      requestEl.querySelector("#video_thumbnail").style.backgroundImage = `url(${thumbnail})`;
      requestEl.querySelector("#video_thumbnail").style.backgroundSize = "cover";
      requestEl.querySelector("#video_thumbnail").style.backgroundPosition = "center";
    }
  }

  // admin header elements
  if (state.user.role === "super user") {
    // videoRef Input on initial request render
    if (request.status === "done" && state.user.role === "super user") {
      // show the input field to add the video ref link
      requestEl.querySelector("[class^='videoRefInput']").classList.remove("d-none");
      requestEl.querySelector("#saveVideoRef").classList.remove("d-none");
    }
    // delete button
    const deleteBtn = requestEl.querySelector("[class^='deleteBtn']");
    deleteBtn.addEventListener("click", (e) => {
      deleteRequest(request);
    });

    // status droplist
    const reqStatusListEl = requestEl.querySelector("[class^='reqStatusList']");
    let oldStatus;
    reqStatusListEl.addEventListener("focus", (e) => {
      oldStatus = e.target.value;
    });
    reqStatusListEl.addEventListener("change", (e) => {
      const newStatus = e.target.value;
      statusChange(request, requestEl, oldStatus, newStatus);
    });

    // video reference link field
    const videoRefEl = requestEl.querySelector("[class^='videoRefInput']");
    // expand on focusIN
    videoRefEl.parentElement.addEventListener("focusin", () => {
      videoRefEl.classList.add("w-75");
      videoRefEl.classList.remove("w-50");
      const videoClearBtn = videoRefEl.querySelector("#videoRefClear");
      videoClearBtn.classList.remove("d-none");
    });
    // collapse on focusOUT
    videoRefEl.parentElement.addEventListener("focusout", () => {
      videoRefEl.classList.remove("w-75");
      videoRefEl.classList.add("w-50");
      videoRefEl.querySelector("#videoRefClear").classList.add("d-none");
    });
    // clear input using clear button
    videoRefEl.querySelector("#videoRefClear").addEventListener("click", () => {
      videoRefEl.querySelector("input[type='text']").value = "";
    });
    // video reference link Save button
    const linkSaveBtn = videoRefEl.parentElement.querySelector("#saveVideoRef");

    linkSaveBtn.addEventListener("click", async () => {
      const videoRefValue = videoRefEl.querySelector("input[type='text']").value;
      const videoRefLinkValue = await updateVideoRefLink(request._id, state.userId, videoRefValue);

      // update video link and thumbnail
      if (videoRefLinkValue.video_link !== "") {
        // get the video thumbnail
        const thumbnail = getThumbnail(videoRefLinkValue.video_link);
        // in case the video thumbnail element doesn't exist (from first time) we'll need to create it
        if (!requestEl.querySelector("#video_thumbnail>a")) {
          const thumbnailDIV = document.createElement("div");
          thumbnailDIV.id = "video_thumbnail";
          thumbnailDIV.classList = "bg-light rounded position-relative order-2";
          thumbnailDIV.setAttribute("style", "aspect-ratio: 16/9;width: 15%;");
          thumbnailDIV.innerHTML = `<a class="d-block w-100 h-100" target="_blank"></a>
            <span class="material-symbols-outlined position-absolute top-50 start-50 translate-middle z-1 fs-1">play_circle</span>
            `;
          requestEl.querySelector("div.card-body").appendChild(thumbnailDIV);
        }
        requestEl.querySelector("#video_thumbnail>a").setAttribute("href", videoRefLinkValue.video_link);
        requestEl.querySelector("#video_thumbnail").style.backgroundImage = `url(${thumbnail})`;
        requestEl.querySelector("#video_thumbnail").style.backgroundSize = "cover";
        requestEl.querySelector("#video_thumbnail").style.backgroundPosition = "center";
      }




      // update requestsList
      state.requestsList = await getSortedVidReqs();
    });
  }
  return requestEl;
}

export { getSingleVidReq };
