import { getAvatarMarkup } from "../../utils/helpers.js";

const BRAND_LOGO = "./Gemini_Generated_Image_3564mx3564mx3564.png";

export function renderNavbar(currentUser, route) {
  return `
    <header class="navbar">
      <div class="navbar-inner">
        <button class="nav-brand nav-brand-with-logo" data-route="/home" type="button">
          <img class="brand-logo brand-logo-nav" src="${BRAND_LOGO}" alt="Vignans Alumni Network logo" />
          <span>Vignans Alumni Network</span>
        </button>
        <nav class="nav-links">
          <button class="nav-btn ${route.name === "home" ? "active" : ""}" data-route="/home" type="button">Home</button>
          <button class="nav-btn ${route.name === "directory" ? "active" : ""}" data-route="/directory" type="button">Directory</button>
          <button class="nav-btn ${route.name === "messages" ? "active" : ""}" data-route="/messages" type="button">Messages</button>
          <button class="nav-btn ${route.name === "profile" ? "active" : ""}" data-route="/profile/${currentUser.id}" type="button">Profile</button>
          <button class="nav-btn" data-action="open-post-modal" type="button">Add Post</button>
        </nav>
        <div class="nav-right">
          <button class="nav-avatar-chip" data-route="/profile/${currentUser.id}" type="button">
            ${getAvatarMarkup(currentUser, "avatar avatar-sm")}
          </button>
          <button class="btn btn-ghost btn-sm" data-action="logout" type="button">Logout</button>
        </div>
      </div>
    </header>
  `;
}
