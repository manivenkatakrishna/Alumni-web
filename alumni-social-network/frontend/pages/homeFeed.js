import { renderPostCard } from "../components/postCard.js";
import { escapeHtml, getAvatarMarkup } from "../../utils/helpers.js";

function renderStories(stories = [], currentUser) {
  return `
    <section class="card stories-card">
      <div class="stories-strip">
        <button class="story-bubble add-story" data-action="open-story-modal" type="button">
          ${getAvatarMarkup(currentUser, "avatar avatar-md")}
          <span>Add Story</span>
        </button>
        ${
          stories.length
            ? stories
                .map(
                  (story) => `
                    <button class="story-bubble" data-action="open-story-view" data-id="${story.id}" type="button">
                      ${getAvatarMarkup(story.user, "avatar avatar-md avatar-ring")}
                      <span>${escapeHtml(story.user?.full_name || "Alumni")}</span>
                    </button>
                  `,
                )
                .join("")
            : `<div class="empty-stories">No stories yet. Share the first highlight.</div>`
        }
      </div>
    </section>
  `;
}

function renderRightRail(feed, currentUser) {
  const suggestions = feed?.suggestedUsers || [];
  return `
    <aside class="home-rail">
      <section class="card widget">
        <div class="profile-mini-top">
          ${getAvatarMarkup(currentUser, "avatar avatar-lg")}
          <div>
            <div class="profile-mini-name">${escapeHtml(currentUser.full_name || "Alumni")}</div>
            <div class="text-muted">${escapeHtml(currentUser.department || "Alumni")} ${currentUser.graduation_year ? `<span class="meta-separator">&middot;</span> ${escapeHtml(currentUser.graduation_year)}` : ""}</div>
            ${currentUser.company ? `<div class="job-line">${escapeHtml(currentUser.company)}</div>` : ""}
          </div>
        </div>
        <hr class="divider" />
        <div class="mini-stats">
          <div><strong>${feed?.posts?.filter((post) => String(post.user_id) === String(currentUser.id)).length || 0}</strong><span>Posts</span></div>
          <div><strong>${suggestions.length}</strong><span>Connections</span></div>
        </div>
      </section>
      <section class="card widget">
        <h3>Suggested Alumni</h3>
        <div class="suggestions-list">
          ${
            suggestions.length
              ? suggestions
                  .map(
                    (user) => `
                      <div class="suggest-item">
                        ${getAvatarMarkup(user, "avatar avatar-xs")}
                        <div class="info">
                          <strong>${escapeHtml(user.full_name)}</strong>
                          <span>${escapeHtml(user.department || "Alumni")}</span>
                        </div>
                        <button class="btn btn-outline btn-sm" data-action="open-message-thread" data-user-id="${user.id}" type="button">Chat</button>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="text-muted">No alumni suggestions available.</p>`
          }
        </div>
      </section>
    </aside>
  `;
}

export function renderHomeFeed(feed, currentUser) {
  return `
    <section class="home-page">
      ${renderStories(feed?.stories || [], currentUser)}
      <div class="two-col-layout">
        <div>
          <section class="card composer-card">
            <form data-form="create-post" class="composer">
              ${getAvatarMarkup(currentUser, "avatar avatar-md")}
              <div class="composer-body">
                <textarea name="text" placeholder="Share something with your alumni network..."></textarea>
                <div class="composer-preview image-preview" id="post-preview"></div>
                <div class="composer-actions">
                  <label class="file-btn">
                    <span>Photo</span>
                    <input type="file" name="image" accept="image/*" data-preview-target="post-preview" />
                  </label>
                  <button class="btn btn-primary" type="submit">Post</button>
                </div>
              </div>
            </form>
          </section>
          <section id="feed-container" class="feed-stack">
            ${
              feed?.posts?.length
                ? feed.posts.map((post) => renderPostCard(post, currentUser)).join("")
                : `<div class="empty-state card"><p>No posts yet. Be the first to share!</p></div>`
            }
          </section>
        </div>
        ${renderRightRail(feed, currentUser)}
      </div>
    </section>
  `;
}
