import { get_loginLink, get_signInFormEl, get_signupLink } from "../dom.js";
import { signInRequest } from "../userFunctions.js";
import { getTheme, swapLoginToSignup, swapSignupToLogin, toggleTheme, updateThemeIcon } from "../utility.js";

export default function Login() {
  const themeMode = getTheme();
  const loginDiv = document.createElement("div");
  loginDiv.className = "container my-5 d-flex flex-column justify-content-center";
  loginDiv.innerHTML = `   
    <nav class="navbar bg-body d-flex flex-row-reverse">
        <div id="toggleTheme" class="btn d-flex align-itmes-center">
            <span class="material-icons-outlined" style="pointer-events:none">${themeMode === "dark" ? "light_mode" : "dark_mode"}</span>
        </div>
    </nav>
  <h3 id="loginFormHeader" class="mt-4 offset-md-4">Welcome Back</h3>
  <div id="loginFormContainer"
            class="login-Form mt-2 py-4 rounded col-md-4 offset-md-4 bg-body-secondary">
            <form
                id="loginForm" class="d-flex flex-column align-items-center"
                novalidate>
                <div class="my-2 col-md-8">
                    <div class="form-group">
                        <label class="form-label" for="author_name">Your name
                            *</label class="form-label">
                        <input class="form-control" name="author_name"
                            placeholder="Write your name here" required
                            type="text"
                            oninvalid="this.setCustomValidity('Pls Enter user name here')"
                            oninput="this.setCustomValidity('')" />
                        <p class="invalid-feedback">
                            Name is required
                        </p>
                    </div>
                </div>
                <div class="my-2 col-md-8">
                    <div class="form-group">
                        <label class="form-label" for="author_email">Your email
                            *</label>
                        <input class="form-control" name="author_email"
                            placeholder="Write your email here" required
                            type="email"
                            oninvalid="this.setCustomValidity('Pls enter a valid email')"
                            oninput="this.setCustomValidity('')" />
                        <p class="invalid-feedback">
                            Enter a valid email
                        </p>
                    </div>
                </div>
                <button id="loginBtn" name="loginBtn" type="submit"
                    class="btn btn-primary mt-2 mb-1 col-md-8">
                    Login
                </button>
                <button id="signupBtn" name="signupBtn" type="submit"
                    class="btn btn-primary mt-2 mb-1 col-md-8 d-none">
                    Signup
                </button>
                <p id="login2Register">don't have account? <a role="button"
                        class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">register
                        instead</a></p>
                <p id="Register2login" class=" d-none">already have an account?
                    <a role="button"
                        class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">login
                        instead</a>
                </p>
                <span id="loginServerError" class="text-danger d-none"></span>
            </form>
        </div>
`;
  return loginDiv;
}

function loginViewUtils() {
  // define DOM elements
  const signInFormEl = get_signInFormEl();
  const signupLink = get_signupLink();
  const loginLink = get_loginLink();
  const themeBtn = document.getElementById("toggleTheme");

  // add event listeners
  signInFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    signInRequest(e);
  });
  signupLink.addEventListener("click", (e) => {
    swapLoginToSignup();
  });
  loginLink.addEventListener("click", (e) => {
    swapSignupToLogin();
  });
  themeBtn.addEventListener("click", (e) => {
    toggleTheme();
    updateThemeIcon(e.target.querySelector("span.material-icons-outlined"));
  });
}
export { loginViewUtils };
