import { state } from "./client.js";
import { clientSideDataHandling, debounceSearch, renderList } from "./utility.js";
// data utilities (sort, search, filter)
export default function dataUtils() {
  // button elements for all 3
  const sortingElms = document.querySelectorAll(".sort_by");
  const searchElm = document.getElementById("searchBox");
  const filterElms = document.querySelectorAll(".filter_by");

  // SORTING
  sortingElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      e.preventDefault();
      state.sortBy = e.target.value;
      // replace getSortedVidReqs which fetches the data from the db using any (sort, filter, search) requirements
          // await renderSortedVidReqs(state.sortBy, state.searchTerm, state.filterBy);
      // we will transition to a client side alternative to minimize server api calls
      const sortedList = clientSideDataHandling(state.sortBy, state.searchTerm, state.filterBy);
      console.log(sortedList)
      renderList(sortedList)
      sortingElms.forEach((element) => {
        element.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });

  // SEARCHING
  // the search field calls the search function on user input
  // to prevent frequest api calls on each letter we use debounceSearch which delays the api call by 500ms
  // if the user enters another input in that 500ms period the previous api call won't trigger
  searchElm.addEventListener("input", async (e) => {
    state.searchTerm = e.target.value;
    debounceSearch(state.sortBy, state.searchTerm, state.filterBy);
  });
  // a clear button that resets the searchbox as well as the requests list by making an empty search
  document.getElementById("clearSearchBox").addEventListener("click", (e) => {
    searchElm.value = "";
    state.searchTerm = undefined;
    debounceSearch(state.sortBy, state.searchTerm, state.filterBy);
  });

  // FILTERING
  filterElms.forEach((elm) => {
    elm.addEventListener("click", async (e) => {
      // update state
      if (e.target.value.toLowerCase() === state.filterBy) {
        return;
      } else {
        // filteredList = sortedRequestsList.filter((request) => request.status.toLowerCase() === e.target.value.toLowerCase());
        state.filterBy = e.target.value.toLowerCase();
      }
      // update requestsList
      // filtering and rendering
          // const filteredRequestsList = await getSortedVidReqs(state.sortBy, state.searchTerm, state.filterBy);
      const filteredRequestsList = clientSideDataHandling(state.sortBy, state.searchTerm, state.filterBy);
      renderList(filteredRequestsList, state.user.role);
      // styling buttons
      filterElms.forEach((elm) => {
        elm.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });
}
