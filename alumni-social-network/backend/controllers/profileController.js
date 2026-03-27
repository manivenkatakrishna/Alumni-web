import { authService } from "../services/authService.js";
import { postService } from "../services/postService.js";
import { uploadFile } from "../../frontend/ui/imageUpload.js";
import { validateGraduationYear, validateRequired } from "../../utils/validation.js";
import { escapeHtml } from "../../utils/helpers.js";

export const profileController = {
  async loadProfile(userId, currentUserId) {
    const [user, allPosts, users] = await Promise.all([
      authService.getUserProfile(userId),
      postService.getFeed(),
      authService.getUsers(""),
    ]);

    return {
      user,
      isOwner: userId === currentUserId,
      posts: allPosts.filter((post) => String(post.user_id) === String(userId)),
      connectionsCount: Math.max(users.length - 1, 0),
    };
  },

  async loadDirectory(currentUserId, search = "") {
    const users = await authService.getUsers(search);
    return {
      search,
      users: users.filter((user) => user.id !== currentUserId),
    };
  },

  async updateProfile(form, userId) {
    const formData = new FormData(form);
    const full_name = formData.get("full_name");
    const department = formData.get("department");
    const graduation_year = formData.get("graduation_year");
    const bio = formData.get("bio");
    const location = formData.get("location");
    const company = formData.get("company");
    const file = formData.get("profile_image");

    validateRequired(full_name, "Full name");
    validateRequired(department, "Department");
    validateGraduationYear(graduation_year);

    const updates = {
      full_name,
      department,
      graduation_year: Number(graduation_year),
      bio,
      location,
      company,
    };

    if (file?.size) {
      updates.profile_image = await uploadFile(file, "profiles");
    }

    return authService.updateUserProfile(userId, updates);
  },

  renderEditProfileModal(user) {
    return `
      <div class="modal-card edit-profile-modal-card">
        <button class="modal-close" data-action="close-modal" type="button">×</button>
        <h3>Edit Profile</h3>
        <form data-form="edit-profile" class="stack-form edit-profile-form-grid">
          <div class="edit-profile-main-column">
            <div class="field">
              <label>Full Name</label>
              <input class="input" name="full_name" placeholder="Full name" value="${escapeHtml(user.full_name || "")}" required />
            </div>
            <div class="field-grid-two">
              <div class="field">
                <label>Graduation Year</label>
                <input class="input" name="graduation_year" type="number" placeholder="Graduation year" value="${escapeHtml(user.graduation_year || "")}" required />
              </div>
              <div class="field">
                <label>Department</label>
                <input class="input" name="department" placeholder="Department" value="${escapeHtml(user.department || "")}" required />
              </div>
            </div>
            <div class="field-grid-two">
              <div class="field">
                <label>Location</label>
                <input class="input" name="location" placeholder="Location" value="${escapeHtml(user.location || "")}" />
              </div>
              <div class="field">
                <label>Current Job</label>
                <input class="input" name="company" placeholder="Current job" value="${escapeHtml(user.company || "")}" />
              </div>
            </div>
            <div class="field">
              <label>Bio</label>
              <textarea class="input" name="bio" rows="6" placeholder="Bio">${escapeHtml(user.bio || "")}</textarea>
            </div>
          </div>
          <div class="edit-profile-side-column">
            <div class="field">
              <label>Profile Image</label>
              <input class="input" type="file" name="profile_image" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-preview-target="profile-preview" />
              <div class="image-preview" id="profile-preview"></div>
            </div>
            <button class="btn btn-primary btn-full" type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    `;
  },
};

