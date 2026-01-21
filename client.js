document.addEventListener("DOMContentLoaded", async function () {
  const formEl = document.getElementById("requestForm");
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendRequest();
  });
  async function sendRequest() {
    const formData = new FormData(formEl);
    try {
      const response = await fetch("http://localhost:4000/video-request", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  const requestsContainer = document.getElementById("listOfRequests");
  const requestsList = await getRequests();

  function renderList(list) {
    requestsContainer.innerHTML = "";
    list.forEach((request) => {
      const vidRequestEl = getSingleVidReq(request);
      requestsContainer.appendChild(vidRequestEl);
    });
  }
  renderList(requestsList);

  async function getRequests() {
    const response = await fetch("http://localhost:4000/video-request");
    const vidRequests = await response.json();
    return vidRequests;
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
    return requestEl
  }
});
