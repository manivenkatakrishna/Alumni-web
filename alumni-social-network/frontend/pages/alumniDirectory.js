import { escapeHtml, getAvatarMarkup } from "../../utils/helpers.js";

export function renderAlumniDirectory(directory) {
  return `
    <section class="directory-page-modern">
      <div class="section-title">Alumni Directory</div>
      <div class="dir-search-row">
        <input class="input" data-directory-search placeholder="Search by name or department..." value="${escapeHtml(directory?.search || "")}" />
      </div>
      <div class="dir-grid">
        ${
          directory?.users?.length
            ? directory.users
                .map(
                  (user) => `
                    <article class="card dir-card-modern">
                      ${getAvatarMarkup(user, "avatar avatar-lg")}
                      <strong>${escapeHtml(user.full_name)}</strong>
                      <span>${user.graduation_year ? `Class of ${escapeHtml(user.graduation_year)}` : "Alumni"}</span>
                      <div class="tag">${escapeHtml(user.department || "Alumni")}</div>
                      ${user.company ? `<div class="dir-job">${escapeHtml(user.company)}</div>` : ""}
                      <div class="dir-actions">
                        <button class="btn btn-outline btn-sm" data-action="open-profile" data-user-id="${user.id}" type="button">View</button>
                        <button class="btn btn-primary btn-sm" data-action="open-message-thread" data-user-id="${user.id}" type="button">Message</button>
                      </div>
                    </article>
                  `,
                )
                .join("")
            : `<div class="empty-state card"><p>No alumni found</p></div>`
        }
      </div>
    </section>
  `;
}
