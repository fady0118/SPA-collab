// this file keeps definition of admin-action functions which are delete requests, modify status & add video reference
import { state } from "./client.js";
import { createPopup, displayDashboard, updateVideoRefLink } from "./utility.js";

// DELETE
// delete function allows admin to make delete requests therefore the request takes the userId value form the state and 
// the server checks that this userId is the admin's
async function deleteRequest(request) {
  // create a request-deletion-popup on (request delete button click)
  // the popup is created using a utility function that creates popups for both status updates and request deletions
  const deleteRequestPopup = createPopup("delete request", request);
  
  // function to handle delete popup actions (confirm, cancel)
  // on confirm the request delete server endpoint is called
  // on cancel nothing happenes
  // on any action the popup is removed
  async function deletePopupHandle(e) {
    const choice = e.target.innerHTML;
    if (choice === "Confirm") {
      await fetch(`http://localhost:4000/video-request/${request._id}`, {
        method: "DELETE",
      });
      // update using showdashboard which fetches the data and calls renderlist
      await displayDashboard(state.user);
    }
    deleteRequestPopup.remove();
  }

  // add event listeners to popup buttons
  const popupBtns = deleteRequestPopup.querySelectorAll("[class^='popup']");
  popupBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      await deletePopupHandle(e);
    });
  });
}

// confirm status-change popup
function statusChange(request, requestEl, oldStatus, newStatus) {
  // create a status-update-popup on status-droplist change
  // the popup is created using a utility function that creates popups for both status updates and request deletions
  const statusChangePopup = createPopup("update request status", request, newStatus)

  // function to handle update popup actions (confirm, cancel)
  // on confirm the status change request is executed
  // on cancel the select elment value resets to the old value
  // on any action the popup is removed
  async function updatePopupHandle(e, newStatus) {
    const choice = e.target.innerHTML;
    let updatedStatusRequest;
    if (choice === "Confirm") {
      const response = await fetch(`http://localhost:4000/video-request/status/${request._id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      updatedStatusRequest = await response.json();

      // we need to clear the video link if the status is changed from done to planned/new
      if (newStatus !== "done" && request.video_ref.link) {
        await updateVideoRefLink(request._id, "");
      }
          
      // update using displayDashboard which fetches the data and calls renderlist function
      await displayDashboard(state.user);

      // click the filter-("newStatus") button
      // why? otherwise the element that we just changed his status can no longer be seen
      document.querySelector(`.filter_by[value='${newStatus.charAt(0).toUpperCase()+newStatus.slice(1)}']`).click();
    } else {
      // reset dropList
      requestEl.querySelector("select.reqStatusList").value = oldStatus;
    }
    statusChangePopup.remove();
    // if (!updatedStatusRequest) {
    //   return;
    // }
  }
  // add event listeners to popup buttons
  const popupBtns = statusChangePopup.querySelectorAll("[class^='popup']");
  popupBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      await updatePopupHandle(e, newStatus);
    });
  });
}

export { deleteRequest, statusChange };
