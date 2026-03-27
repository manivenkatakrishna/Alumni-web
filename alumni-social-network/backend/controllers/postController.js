import { supabase } from "../../supabase.js";
import { getState } from "../../utils/storage.js";
import { validatePost } from "../../utils/validation.js";
import { authService } from "../services/authService.js";
import { postService } from "../services/postService.js";
import { uploadFile } from "../../frontend/ui/imageUpload.js";
import { escapeHtml } from "../../utils/helpers.js";

let storyCache = [];

function mapById(records) {
  return Object.fromEntries((records || []).map((record) => [record.id, record]));
}

export const postController = {
  async loadFeed(currentUserId) {
    const [posts, stories, users] = await Promise.all([
      postService.getFeed(),
      postService.getStories(),
      authService.getUsers(""),
    ]);
    const postIds = posts.map((post) => post.id);
    const [likes, comments] = await Promise.all([
      postService.getLikes(postIds),
      postService.getComments(postIds),
    ]);

    const userMap = mapById(users);
    const commentsByPost = comments.reduce((accumulator, comment) => {
      const collection = accumulator[comment.post_id] || [];
      collection.push({ ...comment, user: userMap[comment.user_id] });
      accumulator[comment.post_id] = collection;
      return accumulator;
    }, {});

    const likesByPost = likes.reduce((accumulator, like) => {
      const collection = accumulator[like.post_id] || [];
      collection.push(like);
      accumulator[like.post_id] = collection;
      return accumulator;
    }, {});

    storyCache = stories.map((story) => ({
      ...story,
      user: userMap[story.user_id],
    }));

    return {
      stories: storyCache,
      suggestedUsers: users.filter((user) => String(user.id) !== String(currentUserId)).slice(0, 5),
      posts: posts.map((post) => {
        const postLikes = likesByPost[post.id] || [];
        return {
          ...post,
          user: userMap[post.user_id],
          comments: commentsByPost[post.id] || [],
          likesCount: postLikes.length,
          likedByCurrentUser: postLikes.some((like) => like.user_id === currentUserId),
        };
      }),
    };
  },

  getStoryById(storyId) {
    return storyCache.find((story) => String(story.id) === String(storyId));
  },

  async createPost(form, userId) {
    const formData = new FormData(form);
    const text = formData.get("text");
    const file = formData.get("image");

    validatePost(text, file?.size ? file : null);

    const image_url = file?.size ? await uploadFile(file, "posts") : "";
    await postService.createPost({ user_id: userId, text, image_url });
  },

  async createStory(form, userId) {
    const formData = new FormData(form);
    const file = formData.get("story_media");

    if (!file?.size) {
      throw new Error("Choose an image or video for your story.");
    }

    const media_url = await uploadFile(file, "stories");
    await postService.createStory({ user_id: userId, media_url });
  },

  async toggleLike(postId, userId) {
    await postService.toggleLike(postId, userId);
  },

  async deletePost(postId, userId) {
    const post = await postService.getPostById(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    if (String(post.user_id) !== String(userId)) {
      throw new Error("Only the post owner can delete this post.");
    }
    await postService.deletePost(postId);
  },

  renderCreatePostModal() {
    const { currentUser } = getState();
    return `
      <div class="modal-card">
        <button class="modal-close" data-action="close-modal" type="button">×</button>
        <h3>Create Post</h3>
        <form data-form="create-post" class="stack-form">
          <div class="composer-inline-head">
            ${currentUser.profile_image ? `<img class="avatar avatar-md" src="${escapeHtml(currentUser.profile_image)}" alt="${escapeHtml(currentUser.full_name)}" />` : `<div class="avatar avatar-md avatar-fallback">${escapeHtml(currentUser.full_name[0])}</div>`}
            <div>
              <strong>${escapeHtml(currentUser.full_name)}</strong>
              <div class="text-muted">${escapeHtml(currentUser.department || "Alumni")}</div>
            </div>
          </div>
          <textarea class="input" name="text" rows="5" placeholder="Share something with your alumni network..."></textarea>
          <div class="field">
            <label>Add photo</label>
            <input class="input" type="file" name="image" accept="image/*" data-preview-target="post-preview" />
          </div>
          <div class="image-preview" id="post-preview"></div>
          <button class="btn btn-primary btn-full" type="submit">Share Post</button>
        </form>
      </div>
    `;
  },

  renderStoryModal() {
    return `
      <div class="modal-card">
        <button class="modal-close" data-action="close-modal" type="button">×</button>
        <h3>Share Story</h3>
        <form data-form="create-story" class="stack-form">
          <div class="field">
            <label>Choose image or video</label>
            <input class="input" type="file" name="story_media" accept="image/*,video/*" data-preview-target="story-preview" />
          </div>
          <div class="image-preview" id="story-preview"></div>
          <button class="btn btn-primary btn-full" type="submit">Upload Story</button>
        </form>
      </div>
    `;
  },

  renderStoryViewer(story) {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(story.media_url);
    return `
      <div class="modal-card story-viewer">
        <button class="modal-close" data-action="close-modal" type="button">×</button>
        <div class="story-viewer-head">
          <h3>${escapeHtml(story.user?.full_name || "Story")}</h3>
        </div>
        ${isVideo ? `<video controls autoplay muted src="${escapeHtml(story.media_url)}"></video>` : `<img src="${escapeHtml(story.media_url)}" alt="Story" />`}
      </div>
    `;
  },

  subscribeToFeed(onRefresh) {
    return supabase
      .channel("feed-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, onRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, onRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, onRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, onRefresh)
      .subscribe();
  },
};
