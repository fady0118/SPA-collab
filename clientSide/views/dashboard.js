import { state } from "../client.js";
import { get_formEl } from "../dom.js";
import { sendVidRequest } from "../userFunctions.js";
import { getTheme, headerResizer, logout, toggleTheme, updateThemeIcon } from "../utility.js";

export default function Dashboard() {
  const dashboardDiv = document.createElement("div");
  dashboardDiv.classList = "container";
  dashboardDiv.innerHTML = `    
            <div id="welcomeDashboard"></div>
            <form id="requestForm" class="mt-4" novalidate>
                <div class="row mb-3">
                    <div class="col-md">
                        <div class="form-group">
                            <label class="form-label" for="topic_title">Topic
                                *</label>
                            <input class="form-control" name="topic_title"
                                placeholder="Write your suggested topic here"
                                required maxlength="100" type="text" />
                            <p class="invalid-feedback">
                                Topic title is required
                            </p>
                            <p class="invalid-feedback">
                                Topic title can't exceed 100 characters
                            </p>
                        </div>
                    </div>
                    <div class="col-md">
                        <div class="form-group">
                            <label class="form-label" for="target_level">Target
                                level</label>
                            <select class="form-control" name="target_level"
                                placeholder="Write your name here">
                                <option value="beginner">Beginner</option>
                                <option value="medium">Medium</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md">
                        <div class="form-group">
                            <label class="form-label" for="topic_details">More
                                details *</label>
                            <textarea class="form-control" name="topic_details"
                                placeholder="Write your topic in more details here"
                                required></textarea>
                            <p class="invalid-feedback">
                                Topic details is required
                            </p>
                        </div>
                    </div>
                    <div class="col-md">
                        <div class="form-group">
                            <label class="form-label"
                                for="expected_result">Expected results</label>
                            <textarea class="form-control"
                                name="expected_result"
                                placeholder="Write what do you expect after watching this video"></textarea>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary mt-3">
                    Send video request
                </button>
            </form>
            <hr />
            <h1 class="mb-4">List of requested videos</h1>
            <div class="d-flex flex-lg-row flex-md-row flex-sm-column flex-xs-column flex-column mb-2
             justify-content-lg-between justify-content-md-between
             align-items-sm-start align-items-xs-start align-items-start">
                <!-- sorting -->
                <div class="btn-group mb-1" role="group" aria-label="Basic example">
                    <button type="button" class="btn btn-primary sort_by active responsive-text-b"
                        value="New First">New First</button>
                    <button type="button" class="btn btn-primary sort_by responsive-text-b"
                        value="Top Voted First">Top Voted First</button>
                </div>
                <!-- filtering -->
                <div class="btn-group mb-1" role="group">
                    <button type="button" class="btn btn-primary filter_by active responsive-text-b"
                        value="All">All</button>
                    <button type="button" class="btn btn-primary filter_by responsive-text-b"
                        value="New">New</button>
                    <button type="button" class="btn btn-primary filter_by responsive-text-b"
                        value="Planned">Planned</button>
                    <button type="button" class="btn btn-primary filter_by responsive-text-b"
                        value="Done">Done</button>
                </div>
                <!-- searching -->
                <div class="position-relative d-flex align-items-center mb-1">
                    <input class="form-control mr-sm-2 bg-transparent text-body" id="searchBox"
                        type="search" placeholder="Search" aria-label="Search">
                    <button type="button" id="clearSearchBox"
                        class="btn btn-sm clear-btn px-2 fs-6 text-white position-absolute top-50 end-0 translate-middle-y"
                        aria-label="Clear search">×</button>
                </div>
            </div>
            <div id="listOfRequests" class="mt-4"></div>`;
  return dashboardDiv;
}

function dashboardViewUtils() {
  function persistState() {
    const sortingElms = document.querySelectorAll(".sort_by");
    const searchElm = document.getElementById("searchBox");
    const filterElms = document.querySelectorAll(".filter_by");
    // check the state.sortBy and reflect it in the UI
    const stateSort = [...sortingElms].find((elm) => elm.value === state.sortBy);
    stateSort.click();
    sortingElms.forEach((elm) => {
      elm.classList.remove("active");
    });
    stateSort.classList.add("active");
    // check the state.searchTerm and reflect it in the UI
    if (state.searchTerm) {
      searchElm.value = state.searchTerm;
    }
    // check the state.filterBy and reflect it in the UI
    const stateFilter = [...filterElms].find((elm) => elm.value.toLowerCase() === state.filterBy);
    stateFilter.click();
    filterElms.forEach((elm) => {
      elm.classList.remove("active");
    });
    stateFilter.classList.add("active");
  }
  persistState();
  // request form event listener
  const formEl = get_formEl();
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendVidRequest(e);
  });
}

export { dashboardViewUtils };
