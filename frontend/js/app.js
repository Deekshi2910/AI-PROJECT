/**
 * Application Entry Point & Multi-Role Event Wiring
 */
document.addEventListener('DOMContentLoaded', () => {
  const engine = new ReasoningEngine(KB_DATA);
  const renderer = new UIRenderer(engine);

  appState.subscribe((state) => {
    renderer.render(state);
  });

  renderer.render(appState);

  // 1. Auth Gateway Tab Switching
  document.querySelectorAll('.auth-role-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const role = e.currentTarget.getAttribute('data-role');
      const container = document.getElementById('auth-role-tabs');
      if (container) container.setAttribute('data-selected-role', role);
      renderer.renderAuthPortal(appState);
    });
  });

  // Auth Form Submission
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const container = document.getElementById('auth-role-tabs');
      const selectedRole = container ? container.getAttribute('data-selected-role') : 'student';
      
      const inputIdEl = document.getElementById('auth-input-id');
      const inputId = inputIdEl ? inputIdEl.value : 'STU2024-042';

      let userObj = KB_DATA.users.find(u => u.id === inputId || u.rollNo === inputId || u.empId === inputId);
      if (!userObj) {
        userObj = { name: "User (" + inputId + ")", role: selectedRole, rollNo: inputId, empId: inputId };
      }

      appState.login(selectedRole, userObj);
      showToast(`Welcome back, ${userObj.name}! Logged into ${selectedRole.toUpperCase()} Portal.`, 'success');
    });
  }

  // Quick Demo Buttons
  document.querySelectorAll('.btn-quick-demo').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const role = e.currentTarget.getAttribute('data-role');
      let userObj = KB_DATA.users.find(u => u.role === role);
      if (!userObj) userObj = KB_DATA.users[0];
      appState.login(role, userObj);
      showToast(`Logged into ${role.toUpperCase()} Portal via Quick Demo.`, 'success');
    });
  });

  // Header Logout Button
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      appState.logout();
      showToast('Logged out of system.', 'info');
    });
  }

  // 2. Student Sub-Nav Tabs
  document.querySelectorAll('.student-nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const subView = e.currentTarget.getAttribute('data-subview');
      appState.setStudentSubView(subView);
    });
  });

  // Student Advisor Wizard Step Navigation
  const btnWizardNext1 = document.getElementById('btn-wizard-next-1');
  const btnWizardNext2 = document.getElementById('btn-wizard-next-2');
  const btnWizardPrev2 = document.getElementById('btn-wizard-prev-2');
  const btnWizardPrev3 = document.getElementById('btn-wizard-prev-3');
  const btnWizardFinish = document.getElementById('btn-wizard-finish');

  if (btnWizardNext1) btnWizardNext1.addEventListener('click', () => appState.setWizardStep(2));
  if (btnWizardNext2) btnWizardNext2.addEventListener('click', () => appState.setWizardStep(3));
  if (btnWizardPrev2) btnWizardPrev2.addEventListener('click', () => appState.setWizardStep(1));
  if (btnWizardPrev3) btnWizardPrev3.addEventListener('click', () => appState.setWizardStep(2));

  if (btnWizardFinish) {
    btnWizardFinish.addEventListener('click', () => {
      appState.setStudentSubView('recommendations');
      showToast('Knowledge Base recommendations evaluated against live gradebook!', 'success');
    });
  }

  // 3. Teacher Portal Controls
  const btnLockPublish = document.getElementById('btn-lock-publish');
  if (btnLockPublish) {
    btnLockPublish.addEventListener('click', () => {
      appState.lockAndPublishTeacherMarks();
      showToast('Class grade roster locked & published! Student CGPAs updated in Knowledge Base.', 'success');
    });
  }

  const teacherCourseSel = document.getElementById('teacher-course-select');
  if (teacherCourseSel) {
    teacherCourseSel.addEventListener('change', (e) => {
      appState.teacherCourse = e.target.value;
      appState.initTeacherBuffer();
      renderer.render(appState);
    });
  }

  const teacherSecSel = document.getElementById('teacher-sec-select');
  if (teacherSecSel) {
    teacherSecSel.addEventListener('change', (e) => {
      appState.teacherSection = e.target.value;
      renderer.render(appState);
    });
  }

  const btnCsvUpload = document.getElementById('btn-csv-upload');
  if (btnCsvUpload) {
    btnCsvUpload.addEventListener('click', () => {
      showToast('CSV Marks Template processed successfully!', 'success');
    });
  }

  // 4. Admin Portal Sub-Nav & Course CRUD Form
  document.querySelectorAll('.admin-nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const subView = e.currentTarget.getAttribute('data-adminview');
      appState.setAdminSubView(subView);
    });
  });

  const adminAddCourseForm = document.getElementById('admin-add-course-form');
  if (adminAddCourseForm) {
    adminAddCourseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('admin-course-code').value;
      const title = document.getElementById('admin-course-title').value;
      const credits = parseInt(document.getElementById('admin-course-credits').value, 10);
      const minCgpa = parseFloat(document.getElementById('admin-course-mincgpa').value);
      const prereqsStr = document.getElementById('admin-course-prereqs').value;
      const prereqs = prereqsStr ? prereqsStr.split(',').map(s => s.trim()) : [];

      appState.addOrUpdateCourse({
        code,
        title,
        credits,
        minCgpa,
        prerequisites: prereqs,
        level: "Core Elective",
        tags: ["#AI", "#Engineering"],
        description: "Admin configured course module."
      });

      showToast(`Course ${code} added to Knowledge Base catalog!`, 'success');
      adminAddCourseForm.reset();
    });
  }

  // Drawer Close Buttons
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const inspectorOverlay = document.getElementById('inspector-overlay');

  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => appState.setInspectedCourse(null));
  if (inspectorOverlay) inspectorOverlay.addEventListener('click', () => appState.setInspectedCourse(null));
});

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
