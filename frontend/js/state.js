/**
 * Application State Manager (Multi-Role Support)
 * Supports Student, Teacher, Admin portals and central Auth Gateway.
 */
class AppState {
  constructor() {
    this.activeRole = "auth"; // "auth" | "student" | "teacher" | "admin"
    this.currentUser = null;

    // Student Sub-View Navigation
    this.studentSubView = "grades"; // "grades" | "advisor" | "recommendations" | "overridden" | "planner"
    this.wizardStep = 1;

    // Teacher Portal State
    this.teacherCourse = "CS201";
    this.teacherSection = "Section A";
    this.teacherYear = "2025-2026";
    this.teacherMarksBuffer = {}; // Map rollNo -> { cie, lab, endSem }

    // Admin Portal Sub-View
    this.adminSubView = "catalog"; // "catalog" | "graph" | "users"

    // Student Advisory Input State
    this.studentInput = {
      rollNo: "STU2024-042",
      cgpa: 3.40,
      passedCourses: ["CS101", "CS201"],
      targetCredits: 12,
      careerGoalId: "ai_researcher",
      interests: {
        "#DeepLearning": 5,
        "#AI": 4,
        "#Logic": 4,
        "#CloudComputing": 2,
        "#DatabaseOptimization": 3
      }
    };

    // Semester Plan Basket
    this.selectedPlanCourses = [];

    // Active course being inspected in slide-out drawer
    this.inspectedCourse = null;

    // Event listeners
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  login(role, userObject) {
    this.activeRole = role;
    this.currentUser = userObject;
    if (role === 'student') {
      this.studentSubView = 'grades';
      this.studentInput.rollNo = userObject.rollNo || 'STU2024-042';
      this.syncStudentMetricsFromGradebook();
    } else if (role === 'teacher') {
      this.initTeacherBuffer();
    }
    this.notify();
  }

  logout() {
    this.activeRole = 'auth';
    this.currentUser = null;
    this.notify();
  }

  setStudentSubView(subView) {
    this.studentSubView = subView;
    this.notify();
  }

  setAdminSubView(subView) {
    this.adminSubView = subView;
    this.notify();
  }

  setWizardStep(step) {
    this.wizardStep = step;
    this.notify();
  }

  syncStudentMetricsFromGradebook() {
    if (this.studentInput.rollNo && KB_DATA.gradebooks[this.studentInput.rollNo]) {
      const calc = KB_DATA.calculateStudentCGPA(this.studentInput.rollNo);
      this.studentInput.cgpa = calc.cgpa;
      this.studentInput.passedCourses = calc.passedCourses;
    }
  }

  updateStudentInput(partial) {
    this.studentInput = { ...this.studentInput, ...partial };
    this.notify();
  }

  toggleInterestTag(tag) {
    if (this.studentInput.interests[tag]) {
      delete this.studentInput.interests[tag];
    } else {
      this.studentInput.interests[tag] = 3;
    }
    this.notify();
  }

  setInterestWeight(tag, weight) {
    this.studentInput.interests[tag] = parseInt(weight, 10);
    this.notify();
  }

  togglePassedCourse(code) {
    const idx = this.studentInput.passedCourses.indexOf(code);
    if (idx >= 0) {
      this.studentInput.passedCourses.splice(idx, 1);
    } else {
      this.studentInput.passedCourses.push(code);
    }
    this.notify();
  }

  // Teacher Marks Grid Methods
  initTeacherBuffer() {
    // Populate teacher buffer from existing student list or gradebooks
    const students = KB_DATA.users.filter(u => u.role === 'student');
    this.teacherMarksBuffer = {};

    students.forEach(s => {
      // Find existing course entry if any
      let existingRecord = null;
      const sGradebook = KB_DATA.gradebooks[s.rollNo] || [];
      sGradebook.forEach(sem => {
        sem.records.forEach(r => {
          if (r.courseCode === this.teacherCourse) {
            existingRecord = r;
          }
        });
      });

      this.teacherMarksBuffer[s.rollNo] = {
        name: s.name,
        cie: existingRecord ? existingRecord.cie : 25,
        lab: existingRecord ? existingRecord.lab : 15,
        endSem: existingRecord ? existingRecord.endSem : 40
      };
    });
  }

  updateTeacherMark(rollNo, field, val) {
    if (this.teacherMarksBuffer[rollNo]) {
      this.teacherMarksBuffer[rollNo][field] = parseInt(val, 10) || 0;
      this.notify();
    }
  }

  lockAndPublishTeacherMarks() {
    // Lock marks and update central KB gradebooks
    Object.keys(this.teacherMarksBuffer).forEach(rollNo => {
      const entry = this.teacherMarksBuffer[rollNo];
      const calc = KB_DATA.calculateScoreDetails(entry.cie, entry.lab, entry.endSem);
      
      const targetCourse = KB_DATA.courses.find(c => c.code === this.teacherCourse) || { title: "Data Structures", credits: 4 };

      if (!KB_DATA.gradebooks[rollNo]) {
        KB_DATA.gradebooks[rollNo] = [];
      }

      // Check if current semester exists
      let semObj = KB_DATA.gradebooks[rollNo].find(s => s.semester.includes("Spring 2025"));
      if (!semObj) {
        semObj = { semester: "Spring 2025 (Active)", records: [] };
        KB_DATA.gradebooks[rollNo].push(semObj);
      }

      // Update or add record
      const recIdx = semObj.records.findIndex(r => r.courseCode === this.teacherCourse);
      const newRecord = {
        courseCode: this.teacherCourse,
        courseTitle: targetCourse.title,
        credits: targetCourse.credits,
        cie: entry.cie,
        lab: entry.lab,
        endSem: entry.endSem,
        total: calc.total,
        grade: calc.grade,
        gradePoints: calc.gradePoints,
        passed: calc.passed
      };

      if (recIdx >= 0) {
        semObj.records[recIdx] = newRecord;
      } else {
        semObj.records.push(newRecord);
      }
    });

    // Re-sync current student inputs
    this.syncStudentMetricsFromGradebook();
    this.notify();
  }

  // Admin Course Catalog CRUD
  addOrUpdateCourse(courseData) {
    const idx = KB_DATA.courses.findIndex(c => c.code === courseData.code);
    if (idx >= 0) {
      KB_DATA.courses[idx] = { ...KB_DATA.courses[idx], ...courseData };
    } else {
      KB_DATA.courses.push({ ...courseData, status: "Active" });
    }
    this.notify();
  }

  deleteCourse(code) {
    const idx = KB_DATA.courses.findIndex(c => c.code === code);
    if (idx >= 0) {
      KB_DATA.courses.splice(idx, 1);
      this.notify();
    }
  }

  // Semester Plan Basket Methods
  addToPlan(courseCode) {
    if (!this.selectedPlanCourses.includes(courseCode)) {
      this.selectedPlanCourses.push(courseCode);
      this.notify();
      return true;
    }
    return false;
  }

  removeFromPlan(courseCode) {
    const idx = this.selectedPlanCourses.indexOf(courseCode);
    if (idx >= 0) {
      this.selectedPlanCourses.splice(idx, 1);
      this.notify();
    }
  }

  setInspectedCourse(item) {
    this.inspectedCourse = item;
    this.notify();
  }
}

// Global App State Instance
const appState = new AppState();
