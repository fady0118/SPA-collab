// this file keeps definition of user-action functions which are sign-in, create requests, add/update vote
import { state } from "./client.js";
import { get_formEl, get_signInFormEl, get_requestsContainer } from "./dom.js"
import { checkTopicFormValidity, checkSignInFormValidity } from "./utility.js";
import { getSingleVidReq } from "./videoReqTemp.js";


// SUBMITTING FORMS
// form handlers to handle signIn and request submit forms
// sign in form takes login form data checks its validity then submits to the backend endpoint or rejects
function signInRequest(e) {
  const signInFormEl = e.target;
  const formData = new FormData(signInFormEl);
  const validationErrors = checkSignInFormValidity(formData);
  if (validationErrors) {
    return;
  }
  signInFormEl.submit();
}

// request submit form takes form data checks its validity then submits to the backend endpoint or rejects
// if the request is accepted by client and server sides the created request is then pushed to the request list that is used to render the requests
// instead of rerendering the entire list we will render the new request only
// the new request is generated using the singleVidReq function and then added to the dom
// we use prepend instead of appendChild since the desired order is newFirst
async function sendVidRequest(e) {
  const formEl = e.target;
  const requestsContainer = get_requestsContainer();

  const formData = new FormData(formEl);
  formData.append("userId", state.userId);
  const validationErrors = checkTopicFormValidity(formData);
  if (validationErrors) {
    return;
  }
  // if no errors detected we proceed to make the request
  try {
    const response = await fetch(`http://localhost:4000/video-request`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    state.requestsList.push(data);
    const vidRequestEl = getSingleVidReq(data, state.user.role);
    requestsContainer.prepend(vidRequestEl);
  } catch (error) {
    console.log(error);
  }
}

// update request vote
// users can upvote or downvote requests as well as remove their old votes
// if i user clicks on a vote button this code will send the request id the userId and vote_type (up, down) to the server
// votes are unique that's why we send the userId so the backend can check the previous vote state
// the server update vote controller knows how to handle this request and returns the updated request
async function updateVote(request_id, e) {
  // the button name is the same as the vote_type so we can use it
  const vote_type = e.target.name;
  console.log({vote_type})
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

export { signInRequest, sendVidRequest, updateVote };
