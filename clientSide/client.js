import { autodetectColorTheme, getState } from "./utility.js";
import router from "./router.js";
// Global states and elements
export const state = {
  userId: "",
  user: "",
  requestsList:[],
  sortBy: "New First",
  searchTerm: undefined,
  filterBy:"all",
  theme:""
};

const savedState = getState();
console.log(savedState)
if(savedState){
  Object.assign(state, JSON.parse(savedState))
}

// add router event listeners
// window.addEventListener("load", router)
window.addEventListener("hashchange", ()=>{
  console.log('hash change', location.hash)
  router()
})

document.addEventListener("DOMContentLoaded", async function () {
  async function checkToken(){
    const response = await fetch("http://localhost:4000/token");
    const data = await response.json();
    if(!data){
      return
    }
    return data;
  }
  const decodedToken = await checkToken();
  if(decodedToken.user){
    state.user = decodedToken.user;
    state.userId = decodedToken.user._id;
  }
  // set doc mode accodring to user preference
  autodetectColorTheme()
  router();

});
