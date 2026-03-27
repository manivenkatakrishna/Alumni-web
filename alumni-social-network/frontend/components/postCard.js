import { renderCommentBox } from "./commentBox.js";
import { escapeHtml, formatRelativeDate, getAvatarMarkup } from "../../utils/helpers.js";

function getCommentLabel(count) {
  return `${count} Comment${count === 1 ? "" : "s"}`;
}

export function renderPostCard(post, currentUser) {
  const liked = Boolean(post.likedByCurrentUser);
  const commentsCount = (post.comments || []).length;

  return `
    <article class="card post-card" data-post-id="${post.id}">
      <div class="post-header">
        ${getAvatarMarkup(post.user, "avatar avatar-md")}
        <div class="post-meta">
          <strong>${escapeHtml(post.user?.full_name || "Alumni")}</strong>
          <span>${escapeHtml(post.user?.department || "Alumni")} <span class="meta-separator">&middot;</span> ${formatRelativeDate(post.created_at)}</span>
        </div>
        ${
          String(post.user_id) === String(currentUser.id)
            ? `<button class="action-btn delete-btn" data-action="delete-post" data-id="${post.id}" type="button">Delete</button>`
            : `<button class="action-btn" data-action="open-profile" data-user-id="${post.user?.id}" type="button">View</button>`
        }
      </div>
      ${post.text ? `<p class="post-text">${escapeHtml(post.text)}</p>` : ""}
      ${
        post.image_url
          ? `
            <div class="post-image-wrap" data-action="image-double-like" data-id="${post.id}" role="button" tabindex="0" aria-label="Like post by double click">
              <img class="post-image" src="${escapeHtml(post.image_url)}" alt="Post media" />
              <div class="post-big-heart" aria-hidden="true">
                <span>&#10084;</span>
              </div>
            </div>
          `
          : ""
      }
      <div class="post-actions">
        <button class="action-btn like-action ${liked ? "liked" : ""}" data-action="toggle-like" data-id="${post.id}" type="button">
          <span class="action-icon heart-icon" aria-hidden="true">&#10084;</span>
          <span>${post.likesCount} Like${post.likesCount === 1 ? "" : "s"}</span>
        </button>
        <button class="action-btn comment-toggle ${post.commentsOpen ? "active" : ""}" data-action="toggle-comments" data-id="${post.id}" type="button" aria-expanded="${post.commentsOpen ? "true" : "false"}" aria-controls="comments-${post.id}">
          <span class="action-icon" aria-hidden="true">&#128172;</span>
          <span>${getCommentLabel(commentsCount)}</span>
        </button>
      </div>
      ${renderCommentBox(post, currentUser)}
    </article>
  `;
}
