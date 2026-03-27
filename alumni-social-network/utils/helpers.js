export function navigate(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatRelativeDate(dateValue) {
  const timestamp = new Date(dateValue).getTime();
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function toFormDataObject(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

export function getInitials(name = "A") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0].toUpperCase())
    .join("");
}

export function getAvatarMarkup(user, className = "avatar") {
  if (user?.profile_image) {
    return `<img class="${className}" src="${escapeHtml(user.profile_image)}" alt="${escapeHtml(user.full_name)}" />`;
  }

  return `<div class="${className} avatar-fallback">${escapeHtml(getInitials(user?.full_name || "A"))}</div>`;
}

export function showToast(message, tone = "success") {
  const root = document.getElementById("toast-root");
  if (!root) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${tone}`;
  toast.textContent = message;
  root.appendChild(toast);

  window.setTimeout(() => toast.classList.add("visible"), 10);
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 200);
  }, 2600);
}
