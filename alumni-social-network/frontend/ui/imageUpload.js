import { getStorageBucket, supabase } from "../../supabase.js";
import { escapeHtml } from "../../utils/helpers.js";

const PROFILE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
const MIME_EXTENSION_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function getAllowedTypes(folder) {
  return folder === "profiles" ? PROFILE_ALLOWED_TYPES : DEFAULT_ALLOWED_TYPES;
}

function getFriendlyTypeList(folder) {
  return folder === "profiles" ? "JPG, PNG, or WebP" : "JPG, PNG, WebP, GIF, MP4, WebM, or MOV";
}

function getFileExtension(file) {
  const mapped = MIME_EXTENSION_MAP[file.type];
  if (mapped) {
    return mapped;
  }

  const originalExt = file.name.split(".").pop()?.toLowerCase();
  return originalExt || "bin";
}

export async function uploadFile(file, folder) {
  const bucket = getStorageBucket(folder);
  const allowedTypes = getAllowedTypes(folder);

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Please upload a valid ${getFriendlyTypeList(folder)} file.`);
  }

  const fileExt = getFileExtension(file);
  const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(`Upload failed for bucket "${bucket}": ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

export function renderImagePreview(input) {
  const targetId = input.dataset.previewTarget;
  const preview = document.getElementById(targetId);
  if (!preview) {
    return;
  }

  preview.innerHTML = "";
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");

  preview.innerHTML = isVideo
    ? `<video controls src="${escapeHtml(url)}"></video>`
    : `<img src="${escapeHtml(url)}" alt="Preview" />`;
}
