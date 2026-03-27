export function renderModalRoot() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-backdrop hidden" id="modal-backdrop"></div>`;
}

export function openModal(content) {
  const backdrop = document.getElementById("modal-backdrop");
  if (!backdrop) {
    return;
  }
  document.body.classList.add("modal-open");
  backdrop.innerHTML = `<div class="modal-shell"><div class="modal-overlay" data-action="close-modal"></div>${content}</div>`;
  backdrop.classList.remove("hidden");
}

export function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (!backdrop) {
    return;
  }
  document.body.classList.remove("modal-open");
  backdrop.classList.add("hidden");
  backdrop.innerHTML = "";
}
