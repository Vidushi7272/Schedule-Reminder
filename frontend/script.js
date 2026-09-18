const API_BASE = "http://localhost:8081";
const SUBJECTS_ENDPOINT = `${API_BASE}/Subject`;

const grid = document.getElementById("subjectsGrid");
const emptyState = document.getElementById("emptyState");
const statusBox = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const dialog = document.getElementById("subjectDialog");
const form = document.getElementById("subjectForm");

let subjects = [];

function showStatus(message, error = false) {
  statusBox.textContent = message;
  statusBox.style.color = error ? "#d94b4b" : "#6b7080";
}

function renderSubjects() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = subjects.filter(s => (s.title || "").toLowerCase().includes(query));

  grid.innerHTML = "";
  emptyState.classList.toggle("hidden", filtered.length !== 0);

  filtered.forEach(subject => {
    const card = document.createElement("article");
    card.className = "subject-card";
    card.style.setProperty("--subject-color", subject.color || "#6c63ff");

    card.innerHTML = `
      <div>
        <h3></h3>
        <div class="subject-id"></div>
      </div>
      <div class="card-actions">
        <button class="secondary edit-btn">Edit</button>
        <button class="danger-outline delete-btn">Delete</button>
      </div>
    `;

    card.querySelector("h3").textContent = subject.title;
    card.querySelector(".subject-id").textContent = subject.id ? `Subject #${subject.id}` : "";

    card.querySelector(".edit-btn").addEventListener("click", () => openEditDialog(subject));
    card.querySelector(".delete-btn").addEventListener("click", () => deleteSubject(subject.id));

    grid.appendChild(card);
  });
}

async function loadSubjects() {
  showStatus("Loading subjects...");
  try {
    const response = await fetch(SUBJECTS_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    subjects = await response.json();
    renderSubjects();
    showStatus(`${subjects.length} subject${subjects.length === 1 ? "" : "s"} loaded.`);
  } catch (error) {
    showStatus("Could not connect to Spring Boot. Check that your backend is running and the endpoint is correct.", true);
    console.error(error);
  }
}

function openAddDialog() {
  form.reset();
  document.getElementById("subjectId").value = "";
  document.getElementById("colorInput").value = "#6c63ff";
  document.getElementById("dialogTitle").textContent = "Add subject";
  dialog.showModal();
}

function openEditDialog(subject) {
  document.getElementById("subjectId").value = subject.id;
  document.getElementById("titleInput").value = subject.title || "";
  document.getElementById("colorInput").value = subject.color || "#6c63ff";
  document.getElementById("dialogTitle").textContent = "Edit subject";
  dialog.showModal();
}

async function saveSubject(event) {
  event.preventDefault();

  const id = document.getElementById("subjectId").value;
  const payload = {
    title: document.getElementById("titleInput").value.trim(),
    color: document.getElementById("colorInput").value
  };

  if (!payload.title) return;

  try {
    const url = id ? `${SUBJECTS_ENDPOINT}/${id}` : SUBJECTS_ENDPOINT;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    dialog.close();
    await loadSubjects();
  } catch (error) {
    showStatus("Could not save subject. Check your controller mapping.", true);
    console.error(error);
  }
}

async function deleteSubject(id) {
  if (!confirm("Delete this subject?")) return;

  try {
    const response = await fetch(`${SUBJECTS_ENDPOINT}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadSubjects();
  } catch (error) {
    showStatus("Could not delete subject.", true);
    console.error(error);
  }
}

async function deleteAllSubjects() {
  if (!confirm("Delete all subjects?")) return;

  try {
    const response = await fetch(SUBJECTS_ENDPOINT, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadSubjects();
  } catch (error) {
    showStatus("Could not delete all subjects.", true);
    console.error(error);
  }
}

document.getElementById("openAddBtn").addEventListener("click", openAddDialog);
document.getElementById("closeDialogBtn").addEventListener("click", () => dialog.close());
document.getElementById("cancelBtn").addEventListener("click", () => dialog.close());
document.getElementById("refreshBtn").addEventListener("click", loadSubjects);
document.getElementById("deleteAllBtn").addEventListener("click", deleteAllSubjects);
searchInput.addEventListener("input", renderSubjects);
form.addEventListener("submit", saveSubject);

loadSubjects();
