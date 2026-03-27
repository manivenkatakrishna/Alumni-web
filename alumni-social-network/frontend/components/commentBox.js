import { escapeHtml, formatRelativeDate, getAvatarMarkup } from "../../utils/helpers.js";

export function renderCommentBox(post, currentUser) {
  const comments = post.comments || [];
  const lastCommentId = comments.length ? comments[comments.length - 1].id : null;

  return `
    <div class="comments-shell ${post.commentsOpen ? "open" : ""}">
      <div class="comments-section" id="comments-${post.id}">
        <form data-form="comment" class="comment-input-row">
          <input type="hidden" name="post_id" value="${post.id}" />
          ${getAvatarMarkup(currentUser, "avatar avatar-xs")}
          <input class="comment-input" name="text" placeholder="Add a comment..." maxlength="300" required />
          <button class="comment-send" type="submit" aria-label="Send comment">&#10148;</button>
        </form>
        <div id="comments-list-${post.id}" class="comments-list">
          ${
            comments.length
              ? comments
                  .map(
                    (comment) => `
                      <div class="comment-item ${post.justAddedComment && String(comment.id) === String(lastCommentId) ? "comment-item-new" : ""}" data-comment-id="${comment.id}">
                        ${getAvatarMarkup(comment.user, "avatar avatar-xs")}
                        <div class="comment-body">
                          <strong>${escapeHtml(comment.user?.full_name || "Alumni")}</strong>
                          <span class="comment-time"> · ${formatRelativeDate(comment.created_at)}</span>
                          <p>${escapeHtml(comment.text)}</p>
                          ${
                            String(comment.user_id) === String(currentUser.id)
                              ? `<button class="del-comment" data-action="delete-comment" data-id="${comment.id}" type="button">Delete</button>`
                              : ""
                          }
                        </div>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="text-muted centered-mini">No comments yet</p>`
          }
        </div>
      </div>
    </div>
  `;
}
