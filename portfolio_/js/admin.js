
/**
 * Admin Panel Javascript Controller for Kurapati Hruthik's Portfolio
 * Handles authentication checks, project registries CRUD, skills manager, and query inbox logs
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndRender();

  // Setup login handler
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const passcode = document.getElementById('admin-passcode').value;
      const alertEl = document.getElementById('login-alert');

      if (passcode === 'Vikitha@26') {
        // Correct passcode
        setAdminLogin(true);
        alertEl.classList.add('d-none');
        checkAuthAndRender();
      } else {
        // Access Denied
        alertEl.classList.remove('d-none');
      }
    });
  }

  // Setup projects form submissions
  const projForm = document.getElementById('project-entry-form');
  if (projForm) {
    projForm.addEventListener('submit', event => {
      event.preventDefault();
      const id = document.getElementById('entry-project-id').value;
      const title = document.getElementById('entry-project-title').value;
      const desc = document.getElementById('entry-project-desc').value;
      const tech = document.getElementById('entry-project-tech').value;
      const link = document.getElementById('entry-project-link').value;

      const projectData = { title, description: desc, technologies: tech, link };

      if (id) {
        // Edit mode
        projectData.id = id;
        updateProject(projectData);
      } else {
        // Create Mode
        addProject(projectData);
      }

      // Close modal and refresh list
      const modalEl = document.getElementById('projectFormModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      projForm.reset();
      renderAdminProjects();
    });
  }

  // Setup add skill form
  const skillForm = document.getElementById('add-skill-form');
  if (skillForm) {
    skillForm.addEventListener('submit', event => {
      event.preventDefault();
      const name = document.getElementById('skill-name').value;
      const category = document.getElementById('skill-category').value;
      const percentage = parseInt(document.getElementById('skill-percentage').value, 10);

      if (name && category && percentage) {
        addSkill({ name, category, percentage });
        skillForm.reset();
        renderAdminSkills();
      }
    });
  }
});

/**
 * Validates authentication tokens and renders appropriate screen overlays
 */
function checkAuthAndRender() {
  const loginScreen = document.getElementById('login-container');
  const dashboardScreen = document.getElementById('dashboard-container');

  if (!loginScreen || !dashboardScreen) return;

  if (isAdminLoggedIn()) {
    loginScreen.classList.add('d-none');
    dashboardScreen.classList.remove('d-none');

    // Populate all components
    renderAdminProjects();
    renderAdminSkills();
    renderAdminQueries();
  } else {
    loginScreen.classList.remove('d-none');
    dashboardScreen.classList.add('d-none');
  }
}

/**
 * Terminate Session
 */
function handleLogout() {
  setAdminLogin(false);
  checkAuthAndRender();
  // Clear input
  const passcodeEl = document.getElementById('admin-passcode');
  if (passcodeEl) passcodeEl.value = '';
}

// ==========================================
// RENDER COMPONENT METHODS
// ==========================================

function renderAdminProjects() {
  const container = document.getElementById('admin-projects-list');
  if (!container) return;

  const projects = getProjects();
  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No projects in database.</td></tr>';
    return;
  }

  projects.forEach(proj => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="align-middle text-light fw-medium">${proj.title}</td>
      <td class="align-middle text-muted small">${proj.technologies}</td>
      <td class="align-middle text-end">
        <button class="btn btn-sm btn-outline-info me-1" onclick="openProjectModal('edit', '${proj.id}')">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="triggerDeleteProject('${proj.id}')">
          <i class="bi bi-trash-fill"></i>
        </button>
      </td>
    `;
    container.appendChild(row);
  });
}

function renderAdminSkills() {
  const container = document.getElementById('admin-skills-list');
  if (!container) return;

  const skills = getSkills();
  container.innerHTML = '';

  if (skills.length === 0) {
    container.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No skills in database.</td></tr>';
    return;
  }

  skills.forEach(skill => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="align-middle text-light fw-medium">${skill.name}</td>
      <td class="align-middle text-muted small">${skill.category}</td>
      <td class="align-middle">
        <div class="d-flex align-items-center gap-2">
          <input type="number" class="form-control form-control-sm bg-dark border-secondary text-light text-center" 
            style="width: 60px;" value="${skill.percentage}" min="10" max="100" 
            onchange="triggerUpdateSkillPercentage('${skill.id}', this.value)">
          <span class="text-muted small">%</span>
        </div>
      </td>
      <td class="align-middle text-end">
        <button class="btn btn-sm btn-outline-danger" onclick="triggerDeleteSkill('${skill.id}')">
          <i class="bi bi-trash-fill"></i>
        </button>
      </td>
    `;
    container.appendChild(row);
  });
}

function renderAdminQueries() {
  const container = document.getElementById('admin-inbox-list');
  const countBadge = document.getElementById('inbox-count-badge');
  const queriesCounter = document.getElementById('analytics-queries-count');

  if (!container) return;

  const queries = getQueries();
  container.innerHTML = '';

  // Update counts
  if (countBadge) countBadge.textContent = queries.length.toString();
  if (queriesCounter) queriesCounter.textContent = queries.length.toString();

  if (queries.length === 0) {
    container.innerHTML = '<p class="text-center text-muted py-4">Your inbox is clear. No inquiries received.</p>';
    return;
  }

  // Render inquiries from newest to oldest
  [...queries].reverse().forEach(q => {
    const item = document.createElement('div');
    item.className = 'border border-secondary bg-dark-subtle rounded p-3 position-relative';
    item.innerHTML = `
      <div class="d-flex flex-column flex-md-row justify-content-between mb-2">
        <div>
          <h4 class="h6 text-info mb-1">${q.subject}</h4>
          <span class="text-light small fw-medium">${q.name}</span> 
          <span class="text-muted small">&lt;${q.email}&gt;</span>
        </div>
        <div class="text-muted small mt-1 mt-md-0">
          <i class="bi bi-clock me-1"></i>${q.timestamp}
        </div>
      </div>
      <p class="text-muted small mb-0 mt-3" style="line-height: 1.6; white-space: pre-line;">
        ${q.message}
      </p>
      <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-3" 
        style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" onclick="triggerDeleteQuery('${q.id}')">
        Resolve & Delete
      </button>
    `;
    container.appendChild(item);
  });
}

// ==========================================
// ACTIONS CALLBACK HANDLERS (EXPOSED GLOBALLY)
// ==========================================

window.openProjectModal = function (mode, id = null) {
  const modalLabel = document.getElementById('projectFormModalLabel');
  const form = document.getElementById('project-entry-form');

  if (!form) return;
  form.reset();

  if (mode === 'add') {
    modalLabel.textContent = 'Add Project Entry';
    document.getElementById('entry-project-id').value = '';
    document.getElementById('entry-project-link').value = '#';
  } else if (mode === 'edit' && id) {
    modalLabel.textContent = 'Edit Project Registry';
    const projects = getProjects();
    const proj = projects.find(p => p.id === id);
    if (proj) {
      document.getElementById('entry-project-id').value = proj.id;
      document.getElementById('entry-project-title').value = proj.title;
      document.getElementById('entry-project-desc').value = proj.description;
      document.getElementById('entry-project-tech').value = proj.technologies;
      document.getElementById('entry-project-link').value = proj.link || '#';
    }
  }

  const modalEl = document.getElementById('projectFormModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

window.triggerDeleteProject = function (id) {
  if (confirm('Are you sure you want to delete this project?')) {
    deleteProject(id);
    renderAdminProjects();
  }
};

window.triggerUpdateSkillPercentage = function (id, percentageVal) {
  const percentage = parseInt(percentageVal, 10);
  if (isNaN(percentage) || percentage < 0 || percentage > 100) return;

  const skills = getSkills();
  const skill = skills.find(s => s.id === id);
  if (skill) {
    skill.percentage = percentage;
    updateSkill(skill);
  }
};

window.triggerDeleteSkill = function (id) {
  if (confirm('Are you sure you want to delete this skill?')) {
    deleteSkill(id);
    renderAdminSkills();
  }
};

window.triggerDeleteQuery = function (id) {
  if (confirm('Mark inquiry as resolved and delete it?')) {
    deleteQuery(id);
    renderAdminQueries();
  }
};
