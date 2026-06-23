/**
 * Storage Layer for Kurapati Hruthik's Portfolio
 * Handles reading/writing data from LocalStorage & SessionStorage
 */

// Initial Seed Data for skills and projects if localStorage is empty
const defaultSkills = [
  { id: '1', name: 'Python', category: 'Programming Languages', percentage: 90 },
  { id: '2', name: 'Java', category: 'Programming Languages', percentage: 85 },
  { id: '3', name: 'C', category: 'Programming Languages', percentage: 80 },
  { id: '4', name: 'JavaScript', category: 'Programming Languages', percentage: 88 },
  { id: '5', name: 'HTML', category: 'Web Technologies', percentage: 90 },
  { id: '6', name: 'CSS', category: 'Web Technologies', percentage: 85 }
];

const defaultProjects = [
  {
    id: 'cargolink',
    title: 'CargoLink – Smart Cargo Booking System',
    description: 'Designed and developed a web-based cargo booking platform to simplify logistics management. The system enables users to select vehicles, manage bookings, generate QR-based confirmations, and maintain booking history. An administrative dashboard facilitates efficient fleet management and monitoring.',
    technologies: 'HTML, CSS, JavaScript, PHP, Oracle Database',
    link: '#',
    image: 'cargolink' // Placeholders or SVG triggers
  }
];

// Initialize all data stores
function initStorage() {
  const DB_VERSION = 'v2_skills_cleanup';
  if (localStorage.getItem('portfolio_db_version') !== DB_VERSION) {
    localStorage.removeItem('portfolio_skills'); // Reset to default skills seed
    localStorage.setItem('portfolio_db_version', DB_VERSION);
  }

  // LocalStorage Seeding
  if (!localStorage.getItem('portfolio_projects')) {
    localStorage.setItem('portfolio_projects', JSON.stringify(defaultProjects));
  }
  if (!localStorage.getItem('portfolio_skills')) {
    localStorage.setItem('portfolio_skills', JSON.stringify(defaultSkills));
  }
  if (!localStorage.getItem('portfolio_queries')) {
    localStorage.setItem('portfolio_queries', JSON.stringify([]));
  }

  // SessionStorage Seeding
  if (!sessionStorage.getItem('portfolio_session_start')) {
    sessionStorage.setItem('portfolio_session_start', Date.now().toString());
  }
  if (!sessionStorage.getItem('portfolio_page_views')) {
    sessionStorage.setItem('portfolio_page_views', '0');
  }
}

// ==========================================
// SESSION ANALYTICS
// ==========================================

function incrementPageView() {
  let count = parseInt(sessionStorage.getItem('portfolio_page_views') || '0', 10);
  count++;
  sessionStorage.setItem('portfolio_page_views', count.toString());
}

function getPageViewCount() {
  return parseInt(sessionStorage.getItem('portfolio_page_views') || '0', 10);
}

function getSessionDuration() {
  const start = parseInt(sessionStorage.getItem('portfolio_session_start') || Date.now().toString(), 10);
  const diff = Date.now() - start;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// ==========================================
// PROJECTS DATABASE (CRUD)
// ==========================================

function getProjects() {
  return JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
}

function saveProjects(projects) {
  localStorage.setItem('portfolio_projects', JSON.stringify(projects));
}

function addProject(project) {
  const projects = getProjects();
  project.id = 'project_' + Date.now();
  projects.push(project);
  saveProjects(projects);
  return project;
}

function updateProject(updatedProj) {
  let projects = getProjects();
  projects = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
  saveProjects(projects);
}

function deleteProject(id) {
  let projects = getProjects();
  projects = projects.filter(p => String(p.id) !== String(id));
  saveProjects(projects);
}

// ==========================================
// SKILLS DATABASE (CRUD)
// ==========================================

function getSkills() {
  return JSON.parse(localStorage.getItem('portfolio_skills') || '[]');
}

function saveSkills(skills) {
  localStorage.setItem('portfolio_skills', JSON.stringify(skills));
}

function addSkill(skill) {
  const skills = getSkills();
  skill.id = 'skill_' + Date.now();
  skills.push(skill);
  saveSkills(skills);
  return skill;
}

function updateSkill(updatedSkill) {
  let skills = getSkills();
  skills = skills.map(s => String(s.id) === String(updatedSkill.id) ? updatedSkill : s);
  saveSkills(skills);
}

function deleteSkill(id) {
  let skills = getSkills();
  skills = skills.filter(s => String(s.id) !== String(id));
  saveSkills(skills);
}

// ==========================================
// CONTACT INQUIRIES DATABASE (CRUD)
// ==========================================

function getQueries() {
  return JSON.parse(localStorage.getItem('portfolio_queries') || '[]');
}

function addQuery(query) {
  const queries = getQueries();
  query.id = 'query_' + Date.now();
  query.timestamp = new Date().toLocaleString();
  queries.push(query);
  localStorage.setItem('portfolio_queries', JSON.stringify(queries));
}

function deleteQuery(id) {
  let queries = getQueries();
  queries = queries.filter(q => String(q.id) !== String(id));
  localStorage.setItem('portfolio_queries', JSON.stringify(queries));
}

// ==========================================
// AUTH STATE
// ==========================================

function isAdminLoggedIn() {
  return sessionStorage.getItem('portfolio_admin_auth') === 'true';
}

function setAdminLogin(status) {
  if (status) {
    sessionStorage.setItem('portfolio_admin_auth', 'true');
  } else {
    sessionStorage.removeItem('portfolio_admin_auth');
  }
}

// Explicit window bindings to guarantee global accessibility
window.getProjects = getProjects;
window.saveProjects = saveProjects;
window.addProject = addProject;
window.updateProject = updateProject;
window.deleteProject = deleteProject;

window.getSkills = getSkills;
window.saveSkills = saveSkills;
window.addSkill = addSkill;
window.updateSkill = updateSkill;
window.deleteSkill = deleteSkill;

window.getQueries = getQueries;
window.addQuery = addQuery;
window.deleteQuery = deleteQuery;

window.isAdminLoggedIn = isAdminLoggedIn;
window.setAdminLogin = setAdminLogin;
window.getPageViewCount = getPageViewCount;
window.getSessionDuration = getSessionDuration;

// Initialize on script load
initStorage();
incrementPageView();
