import { isSupabaseConfigured } from "./supabase.js";
import { authController } from "./backend/controllers/authController.js";
import { postController } from "./backend/controllers/postController.js";
import { commentController } from "./backend/controllers/commentController.js";
import { messageController } from "./backend/controllers/messageController.js";
import { profileController } from "./backend/controllers/profileController.js";
import { authRoutes, isProtectedRoute, normalizeRoute, parseRoute } from "./backend/routes/authRoutes.js";
import { postRoutes } from "./backend/routes/postRoutes.js";
import { messageRoutes } from "./backend/routes/messageRoutes.js";
import { getState, setState, clearSubscriptions, subscribeChannel } from "./utils/storage.js";
import { navigate, showToast, stopEvent, toFormDataObject } from "./utils/helpers.js";
import { validateEmailSearch } from "./utils/validation.js";
import { renderNavbar } from "./frontend/components/navbar.js";
import { renderLoginPage } from "./frontend/pages/loginPage.js";
import { renderSignupPage } from "./frontend/pages/signupPage.js";
import { renderHomeFeed } from "./frontend/pages/homeFeed.js";
import { renderProfilePage } from "./frontend/pages/profilePage.js";
import { renderAlumniDirectory } from "./frontend/pages/alumniDirectory.js";
import { renderMessagesPage } from "./frontend/pages/messagesPage.js";
import { closeModal, openModal, renderModalRoot } from "./frontend/ui/modal.js";
import { renderImagePreview } from "./frontend/ui/imageUpload.js";

const appRoot = document.getElementById("app");
const interactionState = {
  openComments: new Set(),
  recentCommentPostId: null,
};

function renderBootLoading() {
  appRoot.innerHTML = `
    <section class="boot-screen">
      <div class="boot-card">
        <img class="brand-logo brand-logo-boot" src="./Gemini_Generated_Image_3564mx3564mx3564.png" alt="Vignans Alumni Network logo" />\n        <div class="boot-brand">Vignans Alumni Network</div>
        <div class="boot-spinner"></div>
        <p>Loading your alumni network...</p>
      </div>
    </section>
  `;
}

function renderRouteLoading(route, currentUser) {
  if (!currentUser) {
    renderBootLoading();
    return;
  }

  renderLayout(`
    <section class="page-loading-card card">
      <div class="boot-spinner"></div>
      <h3>${route.name === "messages" ? "Opening messages" : route.name === "profile" ? "Opening profile" : route.name === "directory" ? "Loading directory" : "Loading feed"}</h3>
      <p>Please wait a moment...</p>
    </section>
  `);
}

function renderConfigWarning() {
  appRoot.innerHTML = `
    <section class="config-screen">
      <div class="auth-shell">
        <div class="auth-brand-card">
          <div class="brand-badge">Vignans Alumni Network</div>
          <h1>Supabase configuration is required.</h1>
          <p>
            Update <code>window.SUPABASE_CONFIG</code> or edit
            <code>supabase.js</code> with your Supabase project URL and anon key.
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderFatalError(error) {
  const message = error?.message || "Unexpected application error.";
  appRoot.innerHTML = `
    <section class="config-screen">
      <div class="auth-shell">
        <div class="auth-brand-card">
          <div class="brand-badge">Application Error</div>
          <h1>We couldn't start the app.</h1>
          <p>${message}</p>
        </div>
      </div>
    </section>
  `;
}

async function bootstrap() {
  renderModalRoot();

  if (!isSupabaseConfigured()) {
    renderConfigWarning();
    return;
  }

  await authController.initializeSession();
  if (getState().currentUser) {
    await ensureRealtimeSubscriptions();
  }
  setupAuthListener();
  bindGlobalEvents();
  await renderCurrentRoute();
}

function setupAuthListener() {
  authController.onAuthChange(async (session) => {
    if (!session) {
      clearSubscriptions();
      setState({ session: null, currentUser: null });
      navigate(authRoutes.login);
      await renderCurrentRoute();
      return;
    }

    await authController.hydrateCurrentUser();
    await ensureRealtimeSubscriptions();
    await renderCurrentRoute();
  });
}

async function ensureRealtimeSubscriptions() {
  const { currentUser, subscriptionsInitialized } = getState();
  if (!currentUser || subscriptionsInitialized) {
    return;
  }

  const feedChannel = postController.subscribeToFeed(async () => {
    const route = parseRoute();
    if (route.name === "home" || route.name === "profile") {
      await renderCurrentRoute();
    }
  });

  const messageChannel = messageController.subscribeToMessages(currentUser.id, async () => {
    const route = parseRoute();
    if (route.name === "messages") {
      await renderCurrentRoute();
    }
  });

  subscribeChannel(feedChannel);
  subscribeChannel(messageChannel);
  setState({ subscriptionsInitialized: true });
}

async function loadRouteData(route) {
  const { currentUser } = getState();

  if (route.name === "home") {
    const feed = await postController.loadFeed(currentUser.id);
    setState({ feed });
    return;
  }

  if (route.name === "profile") {
    const targetUserId = route.params.id || currentUser.id;
    const profile = await profileController.loadProfile(targetUserId, currentUser.id);
    setState({ profile });
    return;
  }

  if (route.name === "directory") {
    const directory = await profileController.loadDirectory(currentUser.id, route.query.search || "");
    setState({ directory });
    return;
  }

  if (route.name === "messages") {
    const messages = await messageController.loadMessagesPage(currentUser.id, route.params.id || null);
    setState({ messages });
  }
}

function getFeedPostById(postId) {
  return getState().feed?.posts?.find((post) => String(post.id) === String(postId)) || null;
}

function decorateFeed(feed) {
  if (!feed) {
    return feed;
  }

  return {
    ...feed,
    posts: (feed.posts || []).map((post) => ({
      ...post,
      commentsOpen: interactionState.openComments.has(String(post.id)),
      justAddedComment: String(interactionState.recentCommentPostId || "") === String(post.id),
    })),
  };
}

function animateLikeButton(button) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  button.classList.remove("like-animate");
  void button.offsetWidth;
  button.classList.add("like-animate");
}

function animateHeartBurst(postId) {
  const heart = document.querySelector(`[data-post-id="${postId}"] .post-big-heart`);
  if (!(heart instanceof HTMLElement)) {
    return;
  }

  heart.classList.remove("burst");
  void heart.offsetWidth;
  heart.classList.add("burst");
}

function getCommentPostIdFromElement(element) {
  const commentsSection = element?.closest(".comments-section");
  if (!(commentsSection instanceof HTMLElement)) {
    return null;
  }

  return commentsSection.id.replace("comments-", "") || null;
}

function renderLayout(content) {
  const { currentUser } = getState();

  if (!currentUser) {
    appRoot.innerHTML = content;
    return;
  }

  const route = parseRoute();

  appRoot.innerHTML = `
    <div class="app-shell">
      ${renderNavbar(currentUser, route)}
      <main class="app-main">
        <div class="app-container single-column">
          <section class="content-column">${content}</section>
        </div>
      </main>
      <div id="toast-root"></div>
    </div>
  `;
}

async function renderCurrentRoute(shouldLoad = true) {
  const route = normalizeRoute(parseRoute());
  const { currentUser } = getState();

  if (!currentUser && isProtectedRoute(route.name)) {
    navigate(authRoutes.login);
    return renderCurrentRoute(false);
  }

  if (currentUser && (route.name === "login" || route.name === "signup")) {
    navigate(postRoutes.home);
    return renderCurrentRoute(false);
  }

  if (shouldLoad && currentUser) {
    try {
      await loadRouteData(route);
    } catch (error) {
      showToast(error.message || "Something went wrong while loading data.", "error");
    }
  }

  if (route.name === "login") {
    renderLayout(renderLoginPage());
    return;
  }

  if (route.name === "signup") {
    renderLayout(renderSignupPage());
    return;
  }

  if (route.name === "profile") {
    renderLayout(renderProfilePage(getState().profile, currentUser));
    return;
  }

  if (route.name === "directory") {
    renderLayout(renderAlumniDirectory(getState().directory, currentUser));
    return;
  }

  if (route.name === "messages") {
    renderLayout(renderMessagesPage(getState().messages, currentUser));
    return;
  }

  renderLayout(renderHomeFeed(decorateFeed(getState().feed), currentUser));
  interactionState.recentCommentPostId = null;
}


function bindGlobalEvents() {
  window.addEventListener("hashchange", () => renderCurrentRoute());
  window.addEventListener("error", (event) => showToast(event.message || "Unexpected error", "error"));
  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason?.message || "Unexpected request failure";
    showToast(message, "error");
  });

  document.addEventListener("dblclick", async (event) => {
    const imageLikeTarget = event.target.closest("[data-action=\"image-double-like\"]");
    if (!imageLikeTarget) {
      return;
    }

    stopEvent(event);
    const postId = imageLikeTarget.dataset.id;
    const post = getFeedPostById(postId);

    animateHeartBurst(postId);

    if (!post || post.likedByCurrentUser) {
      return;
    }

    try {
      await postController.toggleLike(postId, getState().currentUser.id);
      await renderCurrentRoute();
    } catch (error) {
      showToast(error.message || "Action failed.", "error");
    }
  });

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action], [data-route]");
    if (!target) {
      return;
    }

    if (target.dataset.route) {
      stopEvent(event);
      navigate(target.dataset.route);
      return;
    }

    const { action, id, userId } = target.dataset;

    try {
      if (action === "logout") {
        stopEvent(event);
        await authController.logout();
        closeModal();
        navigate(authRoutes.login);
        return;
      }

      if (action === "open-post-modal") {
        stopEvent(event);
        openModal(postController.renderCreatePostModal());
        return;
      }

      if (action === "open-story-modal") {
        stopEvent(event);
        openModal(postController.renderStoryModal());
        return;
      }

      if (action === "open-profile-edit") {
        stopEvent(event);
        const { profile, currentUser } = getState();
        openModal(profileController.renderEditProfileModal((profile && profile.user) || currentUser));
        return;
      }

      if (action === "close-modal") {
        stopEvent(event);
        closeModal();
        return;
      }

      if (action === "toggle-like") {
        stopEvent(event);
        animateLikeButton(target);
        await postController.toggleLike(id, getState().currentUser.id);
        await renderCurrentRoute();
        return;
      }

      if (action === "toggle-comments") {
        stopEvent(event);
        const postKey = String(id);
        if (interactionState.openComments.has(postKey)) {
          interactionState.openComments.delete(postKey);
        } else {
          interactionState.openComments.add(postKey);
        }
        await renderCurrentRoute(false);
        return;
      }

      if (action === "delete-post") {
        stopEvent(event);
        await postController.deletePost(id, getState().currentUser.id);
        showToast("Post deleted.");
        await renderCurrentRoute();
        return;
      }

      if (action === "delete-comment") {
        stopEvent(event);
        const postId = getCommentPostIdFromElement(target);
        if (postId) {
          interactionState.openComments.add(String(postId));
        }
        const commentItem = target.closest(".comment-item");
        if (commentItem instanceof HTMLElement) {
          commentItem.classList.add("comment-item-leaving");
          await new Promise((resolve) => window.setTimeout(resolve, 220));
        }
        await commentController.deleteComment(id, getState().currentUser.id);
        showToast("Comment deleted.");
        await renderCurrentRoute();
        return;
      }

      if (action === "open-profile") {
        stopEvent(event);
        navigate(`/profile/${userId}`);
        return;
      }

      if (action === "open-message-thread") {
        stopEvent(event);
        navigate(`${messageRoutes.messages}/${userId}`);
        return;
      }

      if (action === "open-story-view") {
        stopEvent(event);
        const story = postController.getStoryById(id);
        if (story) {
          openModal(postController.renderStoryViewer(story));
        }
      }
    } catch (error) {
      showToast(error.message || "Action failed.", "error");
    }
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    try {
      if (form.dataset.form === "login") {
        stopEvent(event);
        const values = toFormDataObject(form);
        await authController.login(values);
        navigate(postRoutes.home);
        closeModal();
        return;
      }

      if (form.dataset.form === "signup") {
        stopEvent(event);
        const payload = await authController.prepareSignupPayload(form);
        await authController.signup(payload);
        navigate(postRoutes.home);
        return;
      }

      if (form.dataset.form === "create-post") {
        stopEvent(event);
        await postController.createPost(form, getState().currentUser.id);
        closeModal();
        showToast("Post shared successfully.");
        await renderCurrentRoute();
        return;
      }

      if (form.dataset.form === "create-story") {
        stopEvent(event);
        await postController.createStory(form, getState().currentUser.id);
        closeModal();
        showToast("Story uploaded.");
        await renderCurrentRoute();
        return;
      }

      if (form.dataset.form === "comment") {
        stopEvent(event);
        const postId = form.querySelector("[name=post_id]")?.value;
        if (postId) {
          interactionState.openComments.add(String(postId));
          interactionState.recentCommentPostId = String(postId);
        }
        await commentController.addComment(form, getState().currentUser.id);
        form.reset();
        await renderCurrentRoute();
        return;
      }

      if (form.dataset.form === "send-message") {
        stopEvent(event);
        await messageController.sendMessage(form, getState().currentUser.id);
        form.reset();
        await renderCurrentRoute();
        return;
      }

      if (form.dataset.form === "edit-profile") {
        stopEvent(event);
        await profileController.updateProfile(form, getState().currentUser.id);
        closeModal();
        showToast("Profile updated.");
        await authController.hydrateCurrentUser();
        await renderCurrentRoute();
        return;
      }
    } catch (error) {
      showToast(error.message || "Submission failed.", "error");
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;

    if (target.matches("[data-preview-target]")) {
      renderImagePreview(target);
      return;
    }

    if (target.matches("[data-directory-search]")) {
      const query = target.value.trim();
      if (query && !validateEmailSearch(query)) {
        return;
      }
      navigate(`/directory?search=${encodeURIComponent(query)}`);
    }
  });
}

renderBootLoading();
bootstrap().catch(renderFatalError);







