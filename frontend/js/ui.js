/**
 * Multi-Role UI Renderer Module
 * Renders Centralized Auth Gateway, Teacher Marks Sheet, Student Academic Dashboard & Advisory, and Admin KB Builder.
 */
class UIRenderer {
  constructor(engine) {
    this.engine = engine;
  }

  render(state) {
    // Hide all major portal containers first
    document.querySelectorAll('.portal-view').forEach(p => p.classList.remove('active'));

    // Show top header user badge and controls if logged in
    const userBadge = document.getElementById('header-user-badge');
    const headerSubNav = document.getElementById('header-sub-nav');
    const btnLogout = document.getElementById('btn-logout');

    if (state.activeRole === 'auth' || !state.currentUser) {
      if (userBadge) userBadge.style.display = 'none';
      if (headerSubNav) headerSubNav.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'none';

      const authPortal = document.getElementById('portal-auth');
      if (authPortal) authPortal.classList.add('active');
      this.renderAuthPortal(state);
      return;
    }

    if (userBadge) {
      userBadge.style.display = 'flex';
      userBadge.className = `user-badge role-${state.activeRole}`;
      userBadge.innerHTML = `
        <i class="fas ${state.activeRole === 'student' ? 'fa-user-grad' : state.activeRole === 'teacher' ? 'fa-chalkboard-teacher' : 'fa-user-shield'}"></i>
        <span>${state.currentUser.name} (${state.activeRole.toUpperCase()})</span>
      `;
    }
    if (headerSubNav) headerSubNav.style.display = 'flex';
    if (btnLogout) btnLogout.style.display = 'inline-flex';

    // Render active role portal view
    switch (state.activeRole) {
      case 'student':
        const studentPortal = document.getElementById('portal-student');
        if (studentPortal) studentPortal.classList.add('active');
        this.renderStudentPortal(state);
        break;
      case 'teacher':
        const teacherPortal = document.getElementById('portal-teacher');
        if (teacherPortal) teacherPortal.classList.add('active');
        this.renderTeacherPortal(state);
        break;
      case 'admin':
        const adminPortal = document.getElementById('portal-admin');
        if (adminPortal) adminPortal.classList.add('active');
        this.renderAdminPortal(state);
        break;
    }

    this.renderInspectorDrawer(state);
  }

  /* ==========================================================================
     1. Unified Authentication Gateway Renderer
     ========================================================================== */
  renderAuthPortal(state) {
    const authRoleContainer = document.getElementById('auth-role-tabs');
    const authInputsContainer = document.getElementById('auth-inputs-container');
    if (!authRoleContainer || !authInputsContainer) return;

    let selectedRole = authRoleContainer.getAttribute('data-selected-role') || 'student';

    authRoleContainer.querySelectorAll('.auth-role-tab').forEach(tab => {
      if (tab.getAttribute('data-role') === selectedRole) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    if (selectedRole === 'student') {
      authInputsContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Student ID / Roll Number</label>
          <input type="text" id="auth-input-id" class="catalog-search-box" value="STU2024-042" style="padding-left:1rem;" placeholder="e.g. STU2024-042">
        </div>
        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Password</label>
          <input type="password" class="catalog-search-box" value="password123" style="padding-left:1rem;">
        </div>
      `;
    } else if (selectedRole === 'teacher') {
      authInputsContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Faculty Employee ID</label>
          <input type="text" id="auth-input-id" class="catalog-search-box" value="FAC-108" style="padding-left:1rem;" placeholder="e.g. FAC-108">
        </div>
        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Assigned Department</label>
          <select id="auth-input-dept" class="catalog-search-box" style="padding-left:1rem;">
            <option value="Computer Science">Computer Science & Engineering</option>
            <option value="Data Science">Data Science & AI</option>
          </select>
        </div>
      `;
    } else {
      authInputsContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Institutional Admin Email</label>
          <input type="text" id="auth-input-id" class="catalog-search-box" value="admin@coursemind.edu" style="padding-left:1rem;">
        </div>
        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Multi-Factor Auth (MFA) PIN</label>
          <input type="password" class="catalog-search-box" value="884920" style="padding-left:1rem;" placeholder="6-Digit MFA PIN">
        </div>
      `;
    }
  }

  /* ==========================================================================
     2. Teacher Portal: Spreadsheet Marks Entry Sheet
     ========================================================================== */
  renderTeacherPortal(state) {
    const tableBody = document.getElementById('teacher-marks-table-body');
    const courseSelect = document.getElementById('teacher-course-select');
    const secSelect = document.getElementById('teacher-sec-select');

    if (courseSelect) courseSelect.value = state.teacherCourse;
    if (secSelect) secSelect.value = state.teacherSection;

    if (!tableBody) return;

    tableBody.innerHTML = '';
    Object.keys(state.teacherMarksBuffer).forEach(rollNo => {
      const entry = state.teacherMarksBuffer[rollNo];
      const calc = KB_DATA.calculateScoreDetails(entry.cie, entry.lab, entry.endSem);

      const cieValid = entry.cie >= 0 && entry.cie <= 30;
      const labValid = entry.lab >= 0 && entry.lab <= 20;
      const endValid = entry.endSem >= 0 && entry.endSem <= 50;

      let gradeClass = "grade-a";
      if (calc.grade === "A+") gradeClass = "grade-aplus";
      if (calc.grade === "B+" || calc.grade === "B") gradeClass = "grade-b";
      if (calc.grade === "C") gradeClass = "grade-c";
      if (calc.grade === "F") gradeClass = "grade-f";

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${rollNo}</strong></td>
        <td>${entry.name}</td>
        <td>
          <input type="number" min="0" max="30" class="cell-input ${cieValid ? 'valid' : 'invalid'}" 
                 data-roll="${rollNo}" data-field="cie" value="${entry.cie}"> / 30
        </td>
        <td>
          <input type="number" min="0" max="20" class="cell-input ${labValid ? 'valid' : 'invalid'}" 
                 data-roll="${rollNo}" data-field="lab" value="${entry.lab}"> / 20
        </td>
        <td>
          <input type="number" min="0" max="50" class="cell-input ${endValid ? 'valid' : 'invalid'}" 
                 data-roll="${rollNo}" data-field="endSem" value="${entry.endSem}"> / 50
        </td>
        <td><strong>${calc.total} / 100</strong></td>
        <td><span class="grade-pill ${gradeClass}">${calc.grade}</span></td>
      `;

      tr.querySelectorAll('.cell-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const rNo = e.target.getAttribute('data-roll');
          const fld = e.target.getAttribute('data-field');
          appState.updateTeacherMark(rNo, fld, e.target.value);
        });
      });

      tableBody.appendChild(tr);
    });
  }

  /* ==========================================================================
     3. Student Portal Renderer
     ========================================================================== */
  renderStudentPortal(state) {
    const evalResult = this.engine.evaluateStudent(state.studentInput);

    // Update Sub-Nav Tabs
    document.querySelectorAll('.student-nav-tab').forEach(tab => {
      if (tab.getAttribute('data-subview') === state.studentSubView) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Toggle Student Sub-Screens
    document.querySelectorAll('.student-subview').forEach(view => {
      view.style.display = 'none';
    });

    const activeView = document.getElementById(`student-view-${state.studentSubView}`);
    if (activeView) activeView.style.display = 'block';

    switch (state.studentSubView) {
      case 'grades':
        this.renderAcademicGradesView(state, evalResult);
        break;
      case 'advisor':
        this.renderStudentAdvisorWizard(state, evalResult);
        break;
      case 'recommendations':
        this.renderStudentRecommendations(state, evalResult);
        break;
      case 'overridden':
        this.renderStudentOverriddenView(state, evalResult);
        break;
      case 'planner':
        this.renderStudentPlannerView(state, evalResult);
        break;
    }
  }

  renderAcademicGradesView(state, evalResult) {
    const cgpaVal = document.getElementById('student-cgpa-val');
    const creditsVal = document.getElementById('student-credits-val');
    const standingVal = document.getElementById('student-standing-val');
    const accordionsContainer = document.getElementById('student-grade-history-accordions');

    if (cgpaVal) cgpaVal.textContent = evalResult.studentMetrics.cgpa.toFixed(2);
    if (creditsVal) creditsVal.textContent = `${evalResult.studentMetrics.passedCourses.length * 4} / 120`;
    
    if (standingVal) {
      let standing = "Good Academic Standing";
      if (evalResult.studentMetrics.cgpa >= 3.5) standing = "Dean's Honor List";
      if (evalResult.studentMetrics.cgpa < 2.5) standing = "Academic Warning";
      standingVal.textContent = standing;
    }

    if (!accordionsContainer) return;

    const semesters = KB_DATA.gradebooks[state.studentInput.rollNo] || [];
    if (semesters.length === 0) {
      accordionsContainer.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted);">No published semester grades found.</div>`;
      return;
    }

    accordionsContainer.innerHTML = '';
    semesters.forEach(sem => {
      const card = document.createElement('div');
      card.className = 'semester-accordion';
      card.innerHTML = `
        <div class="accordion-header">
          <span><i class="fas fa-graduation-cap" style="color:var(--accent-cyan); margin-right:0.5rem;"></i> ${sem.semester}</span>
          <span class="val-badge">${sem.records.length} Courses</span>
        </div>
        <div class="accordion-body">
          <table class="spreadsheet-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>CIE</th>
                <th>Lab</th>
                <th>End-Sem</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${sem.records.map(r => `
                <tr>
                  <td><strong>${r.courseCode}</strong></td>
                  <td>${r.courseTitle}</td>
                  <td>${r.credits}</td>
                  <td>${r.cie} / 30</td>
                  <td>${r.lab} / 20</td>
                  <td>${r.endSem} / 50</td>
                  <td><strong>${r.total}</strong></td>
                  <td><span class="grade-pill ${r.grade === 'A+' ? 'grade-aplus' : r.grade.startsWith('A') ? 'grade-a' : r.grade.startsWith('B') ? 'grade-b' : 'grade-c'}">${r.grade}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      accordionsContainer.appendChild(card);
    });
  }

  renderStudentAdvisorWizard(state, evalResult) {
    // Step panels
    document.querySelectorAll('.wizard-step-panel').forEach(panel => {
      const step = parseInt(panel.getAttribute('data-step'), 10);
      panel.style.display = (step === state.wizardStep) ? 'block' : 'none';
    });

    const bannerCgpa = document.getElementById('advisor-banner-cgpa');
    const bannerPrereqs = document.getElementById('advisor-banner-prereqs');
    if (bannerCgpa) bannerCgpa.textContent = evalResult.studentMetrics.cgpa.toFixed(2);
    if (bannerPrereqs) bannerPrereqs.textContent = evalResult.studentMetrics.passedCourses.join(', ') || 'None';

    // Step 2: Career Grid
    const careerGrid = document.getElementById('wizard-career-grid');
    if (careerGrid) {
      careerGrid.innerHTML = '';
      KB_DATA.careerTracks.forEach(track => {
        const isSelected = state.studentInput.careerGoalId === track.id;
        const card = document.createElement('div');
        card.className = `career-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
          <div class="career-card-header">
            <div class="career-icon"><i class="fas ${track.icon}"></i></div>
            <div class="career-title">${track.title}</div>
          </div>
          <div class="career-skills">
            ${track.requiredTags.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
          </div>
        `;
        card.addEventListener('click', () => {
          appState.updateStudentInput({ careerGoalId: track.id });
        });
        careerGrid.appendChild(card);
      });
    }

    // Step 3: Chips & Sliders
    const chipsContainer = document.getElementById('wizard-interest-chips');
    const slidersContainer = document.getElementById('wizard-interest-sliders');
    if (chipsContainer && slidersContainer) {
      const allTags = ["#DeepLearning", "#AI", "#Logic", "#CloudComputing", "#DevOps", "#Cybersecurity", "#UIUXDesign", "#Frontend", "#Backend", "#DatabaseOptimization", "#DataAnalysis", "#NLP"];

      chipsContainer.innerHTML = '';
      allTags.forEach(tag => {
        const isSelected = !!state.studentInput.interests[tag];
        const chip = document.createElement('div');
        chip.className = `interest-chip ${isSelected ? 'selected' : ''}`;
        chip.textContent = tag;
        chip.addEventListener('click', () => {
          appState.toggleInterestTag(tag);
        });
        chipsContainer.appendChild(chip);
      });

      slidersContainer.innerHTML = '';
      Object.keys(state.studentInput.interests).forEach(tag => {
        const weight = state.studentInput.interests[tag];
        const row = document.createElement('div');
        row.className = 'weight-row';
        row.innerHTML = `
          <div class="form-label-row">
            <span class="form-label">${tag} Intensity</span>
            <span class="val-badge">${weight} / 5</span>
          </div>
          <input type="range" min="1" max="5" value="${weight}">
        `;
        row.querySelector('input').addEventListener('input', (e) => {
          appState.setInterestWeight(tag, e.target.value);
        });
        slidersContainer.appendChild(row);
      });
    }
  }

  renderStudentRecommendations(state, evalResult) {
    this.renderCourseGrid('grid-primary-track', evalResult.primaryTrack, state);
    this.renderCourseGrid('grid-alt-electives', evalResult.alternativeDomain, state);
    this.renderCourseGrid('grid-challenge-electives', evalResult.highChallenge, state);
  }

  renderCourseGrid(containerId, items, state) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; padding: 1.5rem; text-align: center; color: var(--text-muted);">No electives match this tier under current parameters.</div>`;
      return;
    }

    container.innerHTML = '';
    items.forEach(item => {
      const course = item.course;
      const isAdded = state.selectedPlanCourses.includes(course.code);

      const radius = 20;
      const circumference = 2 * Math.PI * radius;
      const strokeOffset = circumference - (item.matchScore / 100) * circumference;
      let strokeColor = "#10B981";
      if (item.matchScore < 85) strokeColor = "#F59E0B";
      if (item.matchScore < 65) strokeColor = "#06B6D4";

      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div>
          <div class="course-card-top">
            <div>
              <span class="course-code">${course.code}</span>
              <h4 class="course-title">${course.title}</h4>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${course.credits} Credits • ${course.level}</span>
            </div>
            <div class="match-gauge-box">
              <svg viewBox="0 0 48 48">
                <circle class="gauge-bg" cx="24" cy="24" r="${radius}"></circle>
                <circle class="gauge-fill" cx="24" cy="24" r="${radius}" 
                        style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeOffset}; stroke: ${strokeColor};"></circle>
              </svg>
              <span class="gauge-text">${item.matchScore}%</span>
            </div>
          </div>

          <div class="badge-row">
            ${item.isTrackDefault ? `<span class="badge badge-default"><i class="fas fa-magic"></i> Default Rule</span>` : ''}
            ${item.activeDefeaters.length > 0 ? `<span class="badge badge-exception"><i class="fas fa-exclamation-triangle"></i> Exception</span>` : '<span class="badge badge-cleared"><i class="fas fa-check"></i> Prereqs Cleared</span>'}
          </div>

          <div class="rule-summary-box ${item.activeDefeaters.length > 0 ? 'has-exception' : ''}">
            ${item.defaultRuleSummary}
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-card-action btn-inspect" data-code="${course.code}">
            <i class="fas fa-project-diagram"></i> Inspect Logic
          </button>
          <button class="btn-card-action btn-card-add ${isAdded ? 'added' : ''}" data-code="${course.code}">
            <i class="fas ${isAdded ? 'fa-check-circle' : 'fa-plus-circle'}"></i> ${isAdded ? 'In Plan' : 'Add to Plan'}
          </button>
        </div>
      `;

      card.querySelector('.btn-inspect').addEventListener('click', () => {
        appState.setInspectedCourse(item);
      });

      card.querySelector('.btn-card-add').addEventListener('click', () => {
        if (isAdded) {
          appState.removeFromPlan(course.code);
        } else {
          appState.addToPlan(course.code);
        }
      });

      container.appendChild(card);
    });
  }

  renderStudentOverriddenView(state, evalResult) {
    const container = document.getElementById('overridden-container');
    if (!container) return;

    if (evalResult.overriddenExcluded.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; background: var(--bg-card); padding: 3rem; text-align: center; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <i class="fas fa-check-circle" style="font-size: 3rem; color: #10B981; margin-bottom: 1rem;"></i>
          <h3>No Overridden Courses</h3>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0.5rem auto;">All default recommendations for your selected career path cleared prerequisite and CGPA defeater checks!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    evalResult.overriddenExcluded.forEach(item => {
      const course = item.course;
      const card = document.createElement('div');
      card.className = 'overridden-card';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="course-code" style="color: var(--badge-overridden-border);">${course.code}</span>
            <h4 class="course-title" style="text-decoration: line-through; opacity: 0.8;">${course.title}</h4>
          </div>
          <span class="badge badge-overridden"><i class="fas fa-ban"></i> Overridden</span>
        </div>

        <div class="negation-reason-box">
          <i class="fas fa-exclamation-circle"></i> ${item.activeDefeaters.map(d => d.negationReason).join('<br>')}
        </div>

        <div class="remediation-box">
          <strong><i class="fas fa-lightbulb"></i> Remediation Guidance:</strong><br>
          ${item.activeDefeaters.map(d => d.remediation).join('<br>')}
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderStudentPlannerView(state, evalResult) {
    const basketContainer = document.getElementById('planner-basket-list');
    const creditCount = document.getElementById('planner-credit-count');
    const maxCreditVal = document.getElementById('planner-max-credits');
    const progressFill = document.getElementById('planner-credit-progress');

    if (!basketContainer) return;

    const selectedObj = state.selectedPlanCourses.map(code => KB_DATA.courses.find(c => c.code === code)).filter(Boolean);

    let totalCredits = 0;
    selectedObj.forEach(c => totalCredits += c.credits);

    if (creditCount) creditCount.textContent = totalCredits;
    if (maxCreditVal) maxCreditVal.textContent = state.studentInput.targetCredits;

    const percent = Math.min((totalCredits / state.studentInput.targetCredits) * 100, 100);
    if (progressFill) progressFill.style.width = `${percent}%`;

    if (selectedObj.length === 0) {
      basketContainer.innerHTML = `<div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">Your semester plan basket is empty.</div>`;
      return;
    }

    basketContainer.innerHTML = '';
    selectedObj.forEach(course => {
      const itemRow = document.createElement('div');
      itemRow.style.cssText = `
        display: flex; justify-content: space-between; align-items: center;
        background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-light);
        padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;
      `;
      itemRow.innerHTML = `
        <div>
          <strong style="color: var(--accent-cyan);">${course.code}</strong> - ${course.title}
          <div style="font-size: 0.8rem; color: var(--text-muted);">${course.credits} Credits</div>
        </div>
        <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; color: var(--badge-overridden-border);" data-code="${course.code}">Remove</button>
      `;
      itemRow.querySelector('button').addEventListener('click', () => {
        appState.removeFromPlan(course.code);
      });
      basketContainer.appendChild(itemRow);
    });
  }

  /* ==========================================================================
     4. Admin Portal Renderer
     ========================================================================== */
  renderAdminPortal(state) {
    document.querySelectorAll('.admin-nav-tab').forEach(tab => {
      if (tab.getAttribute('data-adminview') === state.adminSubView) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-subview').forEach(view => view.style.display = 'none');
    const activeView = document.getElementById(`admin-view-${state.adminSubView}`);
    if (activeView) activeView.style.display = 'block';

    if (state.adminSubView === 'catalog') {
      const tableBody = document.getElementById('admin-catalog-table-body');
      if (!tableBody) return;

      tableBody.innerHTML = '';
      KB_DATA.courses.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${c.code}</strong></td>
          <td>${c.title}</td>
          <td>${c.credits}</td>
          <td>Min CGPA ≥ ${c.minCgpa.toFixed(2)}</td>
          <td>${c.prerequisites.join(', ') || 'None'}</td>
          <td><span class="badge badge-cleared">${c.status}</span></td>
          <td>
            <button class="btn btn-secondary btn-delete-course" data-code="${c.code}" style="padding: 3px 8px; font-size:0.75rem; color:#F87171;">Delete</button>
          </td>
        `;
        tr.querySelector('.btn-delete-course').addEventListener('click', () => {
          appState.deleteCourse(c.code);
        });
        tableBody.appendChild(tr);
      });
    }
  }

  renderInspectorDrawer(state) {
    const overlay = document.getElementById('inspector-overlay');
    const drawer = document.getElementById('inspector-drawer');
    const body = document.getElementById('inspector-drawer-body');

    if (!state.inspectedCourse) {
      if (overlay) overlay.classList.remove('active');
      if (drawer) drawer.classList.remove('active');
      return;
    }

    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');

    const item = state.inspectedCourse;
    const course = item.course;
    const trace = item.logicTrace;

    if (body) {
      body.innerHTML = `
        <div>
          <span style="color: var(--accent-cyan); font-weight: bold; font-size: 0.85rem;">${course.code}</span>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.25rem;">${course.title}</h3>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">${course.description}</p>
        </div>

        <div class="flowchart-container">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
            <i class="fas fa-sitemap" style="color: var(--primary);"></i> Reasoning Flowchart
          </h4>

          <div class="flow-step">
            <div class="flow-step-icon"><i class="fas fa-database"></i></div>
            <div class="flow-step-content">
              <div class="flow-step-title">Stage 1: Faculty Gradebook Facts</div>
              <div class="flow-step-desc">Live CGPA: ${state.studentInput.cgpa.toFixed(2)} | Passed Prereqs: [${state.studentInput.passedCourses.join(', ')}]</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="flow-step-icon"><i class="fas fa-magic"></i></div>
            <div class="flow-step-content">
              <div class="flow-step-title">Stage 2: Default Rule Evaluation</div>
              <div class="flow-step-desc">${trace.defaultAssumption}</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="flow-step-icon"><i class="fas fa-shield-alt"></i></div>
            <div class="flow-step-content">
              <div class="flow-step-title">Stage 3: Defeater Validation (Exceptions)</div>
              <div class="flow-step-desc">${trace.activeDefeaters.length === 0 ? 'No defeaters triggered. Default holds.' : `${trace.activeDefeaters.length} defeater exception(s) active.`}</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="flow-step-icon"><i class="fas fa-flag-checkered"></i></div>
            <div class="flow-step-content">
              <div class="flow-step-title">Stage 4: Final Recommendation Conclusion</div>
              <div class="flow-step-desc">${trace.finalDecision}</div>
            </div>
          </div>
        </div>

        <div class="checklist-box">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">
            <i class="fas fa-tasks"></i> Defeater Validation Checklist
          </h4>
          ${trace.defeaterChecks.map(chk => `
            <div class="checklist-item">
              <span>${chk.name}: <small style="color: var(--text-muted);">${chk.detail}</small></span>
              <span class="${chk.passed ? 'check-pass' : 'check-fail'}">
                <i class="fas ${chk.passed ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${chk.passed ? 'Passed' : 'Triggered'}
              </span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
}
