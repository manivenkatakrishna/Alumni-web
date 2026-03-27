import { escapeHtml, getAvatarMarkup } from "../../utils/helpers.js";

function renderPosts(posts = [], currentUserId) {
  if (!posts.length) {
    return `<div class="empty-state card"><p>No posts yet. Share something!</p></div>`;
  }

  return `
    <div class="profile-grid-posts">
      ${posts
        .map(
          (post) => `
            <article class="profile-grid-tile">
              ${
                post.image_url
                  ? `<img class="profile-grid-image" src="${escapeHtml(post.image_url)}" alt="Profile post" />`
                  : `<div class="profile-grid-text-tile"><p>${escapeHtml(post.text || "Text post")}</p></div>`
              }
              <div class="profile-grid-overlay">
                <div class="profile-grid-meta">
                  <span>${post.image_url ? "Photo" : "Post"}</span>
                  ${post.text ? `<strong>${escapeHtml(post.text).slice(0, 72)}${post.text.length > 72 ? "..." : ""}</strong>` : ""}
                </div>
                ${String(post.user_id) === String(currentUserId) ? `<button class="profile-grid-delete" data-action="delete-post" data-id="${post.id}" type="button">Delete</button>` : ""}
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderProfilePage(profile, currentUser) {
  const user = profile?.user || currentUser;
  return `
    <section class="profile-page-modern">
      <div class="card profile-shell">
        <div class="profile-cover"></div>
        <div class="profile-info">
          <div class="profile-avatar-row">
            <div class="profile-id-block">
              ${getAvatarMarkup(user, "avatar avatar-xl avatar-ring")}
              <div>
                <div class="profile-name">${escapeHtml(user.full_name || "Alumni")}</div>
                <div class="profile-dept">${escapeHtml(user.department || "Alumni")} ${user.graduation_year ? `<span class="meta-separator">&middot;</span> Class of ${escapeHtml(user.graduation_year)}` : ""}</div>
                ${user.company ? `<div class="job-line">${escapeHtml(user.company)}</div>` : ""}
              </div>
            </div>
            ${profile?.isOwner ? `<button class="btn btn-outline" data-action="open-profile-edit" type="button">Edit Profile</button>` : `<button class="btn btn-primary" data-action="open-message-thread" data-user-id="${user.id}" type="button">Send Message</button>`}
          </div>
          ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : ""}
          <div class="profile-inline-meta">
            ${user.location ? `<span>Location: ${escapeHtml(user.location)}</span>` : ""}
            ${user.email ? `<span>Email: ${escapeHtml(user.email)}</span>` : ""}
          </div>
          <div class="profile-stats">
            <div class="stat"><div class="num">${profile?.posts?.length || 0}</div><div class="lbl">Posts</div></div>
            <div class="stat"><div class="num">${profile?.connectionsCount || 0}</div><div class="lbl">Connections</div></div>
            <div class="stat"><div class="num">${escapeHtml(user.graduation_year || "--")}</div><div class="lbl">Grad Year</div></div>
          </div>
          ${user.department ? `<div class="profile-tags"><span class="tag">${escapeHtml(user.department)}</span></div>` : ""}
        </div>
      </div>
      <div class="profile-posts-section">
        <div class="profile-posts-bar">
          <span class="profile-posts-bar-icon">#</span>
          <span>${profile?.isOwner ? "POSTS" : "PROFILE POSTS"}</span>
        </div>
        <div class="profile-posts-stack">${renderPosts(profile?.posts || [], currentUser.id)}</div>
      </div>
    </section>
  `;
}
