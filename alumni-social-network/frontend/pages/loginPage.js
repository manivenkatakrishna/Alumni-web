const BRAND_LOGO = "./Gemini_Generated_Image_3564mx3564mx3564.png";

export function renderLoginPage() {
  return `
    <section class="auth-shell auth-minimal-shell">
      <div class="auth-outer">
        <div class="auth-box auth-minimal-card card">
          <div class="auth-logo-wrap">
            <img class="brand-logo brand-logo-auth" src="${BRAND_LOGO}" alt="Vignans Alumni Network logo" />
            <h1>Vignans Alumni Network</h1>
            <p>Reconnect with your alumni community.</p>
          </div>
          <form data-form="login" class="auth-form auth-minimal-form">
            <div class="field">
              <label>Email</label>
              <input class="input auth-input" name="email" type="email" placeholder="you@university.edu" autocomplete="email" required />
            </div>
            <div class="field">
              <label>Password</label>
              <input class="input auth-input" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required />
            </div>
            <button class="btn btn-primary btn-full auth-primary-button" type="submit">Log In</button>
          </form>
        </div>
        <div class="auth-switch-card card">
          <span>Don't have an account?</span>
          <button class="text-link auth-switch-link" data-route="/signup" type="button">Sign up</button>
        </div>
      </div>
    </section>
  `;
}
