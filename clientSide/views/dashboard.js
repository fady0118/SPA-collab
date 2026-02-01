import { state } from "../client.js";
import { get_formEl } from "../dom.js";
import { sendVidRequest } from "../userFunctions.js";
import { getTheme, logout, navigate, toggleTheme, updateThemeIcon } from "../utility.js";

export default function Dashboard() {
  // get color theme
  const themeMode = getTheme();
  const dashboardDiv = document.createElement("div");
  dashboardDiv.className = "container py-1 d-flex flex-column justify-content-center";
  dashboardDiv.innerHTML = `    
  <nav class="navbar bg-body">
        <div id="toggleTheme" class="btn d-flex align-itmes-center">
            <span class="material-icons-outlined" style="pointer-events:none">${themeMode === "dark" ? "light_mode" : "dark_mode"}</span>
        </div>
        <button id="logoutBtn" type="button" class="btn btn-outline-danger">Logout</button>
    </nav>
  <div id="app_container" class="app-Content">
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
            <div class="d-flex flex-row justify-content-sm-between  mb-2">
                <!-- sorting -->
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button type="button" class="btn btn-primary sort_by active"
                        value="New First">New First</button>
                    <button type="button" class="btn btn-primary sort_by"
                        value="Top Voted First">Top Voted First</button>
                </div>
                <!-- filtering -->
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-primary filter_by active"
                        value="All">All</button>
                    <button type="button" class="btn btn-primary filter_by"
                        value="New">New</button>
                    <button type="button" class="btn btn-primary filter_by"
                        value="Planned">Planned</button>
                    <button type="button" class="btn btn-primary filter_by"
                        value="Done">Done</button>
                </div>
                <!-- searching -->
                <div class="position-relative d-flex align-items-center">
                    <input class="form-control mr-sm-2 bg-transparent text-white" id="searchBox"
                        type="search" placeholder="Search" aria-label="Search">
                    <button type="button" id="clearSearchBox"
                        class="btn btn-sm clear-btn px-2 fs-6 text-white position-absolute top-50 end-0 translate-middle-y"
                        aria-label="Clear search">×</button>
                </div>
            </div>
            <div id="listOfRequests" class="mt-4"></div>
        </div>`;
  return dashboardDiv;
}

function dashboardViewUtils() {
  // request form event listener
  const formEl = get_formEl();
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendVidRequest(e);
  });
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

export { dashboardViewUtils };
