import { commentService } from "../services/commentService.js";
import { validateRequired } from "../../utils/validation.js";

export const commentController = {
  async addComment(form, userId) {
    const formData = new FormData(form);
    const post_id = formData.get("post_id");
    const text = formData.get("text");

    validateRequired(text, "Comment");
    await commentService.addComment({ post_id, user_id: userId, text });
  },

  async deleteComment(commentId, userId) {
    const comment = await commentService.getCommentById(commentId);
    if (!comment) {
      throw new Error("Comment not found.");
    }
    if (String(comment.user_id) !== String(userId)) {
      throw new Error("Only the comment owner can delete this comment.");
    }
    await commentService.deleteComment(commentId);
  },
};
