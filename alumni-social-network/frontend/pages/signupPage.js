const BRAND_LOGO = "./Gemini_Generated_Image_3564mx3564mx3564.png";

export function renderSignupPage() {
  return `
    <section class="auth-shell auth-minimal-shell">
      <div class="auth-outer auth-outer-wide">
        <div class="auth-box auth-minimal-card card">
          <div class="auth-logo-wrap">
            <img class="brand-logo brand-logo-auth" src="${BRAND_LOGO}" alt="Vignans Alumni Network logo" />
            <h1>Vignans Alumni Network</h1>
            <p>Create your alumni profile.</p>
          </div>
          <form data-form="signup" class="auth-form auth-minimal-form">
            <div class="field">
              <label>Full Name</label>
              <input class="input auth-input" name="full_name" placeholder="Jane Doe" autocomplete="name" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input class="input auth-input" name="email" type="email" placeholder="jane@university.edu" autocomplete="email" required />
            </div>
            <div class="field">
              <label>Password</label>
              <input class="input auth-input" name="password" type="password" placeholder="Minimum 6 characters" autocomplete="new-password" required />
            </div>
            <div class="auth-two-col">
              <div class="field">
                <label>Department</label>
                <input class="input auth-input" name="department" placeholder="Computer Science" required />
              </div>
              <div class="field">
                <label>Graduation Year</label>
                <input class="input auth-input" name="graduation_year" type="number" placeholder="2020" required />
              </div>
            </div>
            <div class="field">
              <label>Profile Image Upload</label>
              <input class="input auth-input" name="profile_image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-preview-target="signup-preview" />
              <div class="image-preview auth-image-preview" id="signup-preview"></div>
            </div>
            <button class="btn btn-primary btn-full auth-primary-button" type="submit">Create Account</button>
          </form>
        </div>
        <div class="auth-switch-card card">
          <span>Already have an account?</span>
          <button class="text-link auth-switch-link" data-route="/login" type="button">Log in</button>
        </div>
      </div>
    </section>
  `;
}
