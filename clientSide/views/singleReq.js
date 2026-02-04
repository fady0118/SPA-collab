import { state } from "../client.js";
import { updateVote } from "../userFunctions.js";
export default function singleReqPage(request) {
  let videoId, embedLink;
  if (request.video_ref.link) {
    videoId = request.video_ref.link.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/)[1];
    embedLink = `https://www.youtube.com/embed/${videoId}`;
  }

  const singleReqView = document.createElement("div");
  singleReqView.id = `Req-${request._id}`;
  singleReqView.className = "m-2";
  singleReqView.innerHTML = `
        <div class="row mb-3"> <h3 class="w-100 responsive-text-h">${request.topic_title}</h3></div>
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-5 d-flex flex-column flex-lg-column flex-md-row flex-sm-column flex-xs-column justify-content-md-between justify-content-start justify-content-lg-start">
                <div class="col-lg-12 col-md-10 col-sm-12 col-xs-12 col-12">
                    <div class="container-fluid border-body shadow p-2 m-0 w-100 responsive-text-p">
                        <div class="row pb-3">
                            <div class="col ">Topic Details</div>
                            <div class="col">${request.topic_details}</div>
                        </div>
                        <div class="row pb-3">
                            <div class="col">Expected Results</div>
                            <div class="col">${request.expected_result}</div>
                        </div>
                        <div class="row pb-3">
                            <div class="col">Author</div>
                            <div class="col">${request.author.author_name}</div>
                        </div>
                        <div class="row pb-3">
                            <div class="col">Target level</div>
                            <div class="col">${request.target_level}</div>
                        </div>
                        <div class="row pb-3">
                            <div class="col">Status</div>
                            <div class="col">${request.status}</div>
                        </div>
                    </div>
                </div>
                <div class="border-body shadow p-1 d-flex justify-content-evenly align-items-center flex-lg-row flex-md-column flex-sm-row flex-xs-row col-lg-12 col-md-1 col-sm-12 col-xs-12 col-12">

                    <a class="btn upvote-btn vote-singleReq ${request.votes["ups"].includes(state.userId) ? "voteBtnStyle" : ""}" name="ups">🢁</a>
                    <span class="voteScore responsive-text-p">${request.votes["ups"].length - request.votes["downs"].length}</span>
                    <a class="btn downvote-btn vote-singleReq ${request.votes["downs"].includes(state.userId) ? "voteBtnStyle" : ""}" name="downs">🢃</a>
                    <span id="shareBtb" class="text-capitalize" style="cursor:pointer;">share🔗</span>

                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-7 d-flex flex-column flex-lg-column flex-md-row flex-sm-column flex-xs-column">
                <div class="ratio ratio-16x9 d-flex justify-content-center align-items-center">
                ${
                  embedLink
                    ? `
                    <div class="w-100 overflow-hidden shadow" style="border-radius:1rem;">
                        <iframe class="w-100 h-100"
                            src="${embedLink}" allowfullscreen>
                        </iframe>
                    </div>
                    `
                    : ""
                }
                </div>
            </div>
        </div>
    `;
  return singleReqView;
}

function singleReqUtils(request) {
  const requestEl = document.querySelector("[id^='Req-']");
  // add event listeners to vote buttons
  const voteButtons = requestEl.querySelectorAll("[class^='btn upvote-btn'], [class^='btn downvote-btn']");
  voteButtons.forEach((voteBtn) => {
    voteBtn.addEventListener("click", (e) => {
      updateVote(request._id, e);
    });
  });

  // share button
  const shareBtb = requestEl.querySelector("#shareBtb");
  shareBtb.addEventListener("click", async () => {
        navigator.clipboard.writeText(request.video_ref.link);
        await shareFeedback();
  })
  
}

async function shareFeedback(){
    const popup = document.createElement('div');
    popup.classList = 'position-fixed top-50 start-50 translate-middle bg-body shadow border border-secondary py-2 px-3 rounded fs-6 z-3'
    popup.innerHTML = 'Copied to clipboard!'
    document.body.appendChild(popup)
    setTimeout(()=>{
        popup.remove()
    },650)
}
export { singleReqUtils };
