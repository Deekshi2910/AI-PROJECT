/**
 * Knowledge Base (KB) Facts & Multi-Role Data Repository
 * Contains Courses, Users, Gradebooks, Default Rules, and Defeater Exceptions.
 */
const KB_DATA = {
  // Available course catalog
  courses: [
    {
      code: "CS101",
      title: "Introduction to Computer Science & Logic",
      credits: 4,
      level: "Foundational",
      prerequisites: [],
      minCgpa: 2.0,
      tags: ["#Programming", "#Logic", "#Algorithms"],
      description: "Fundamental concepts of computational thinking, boolean logic, and problem-solving strategies.",
      status: "Active"
    },
    {
      code: "CS201",
      title: "Data Structures & Discrete Mathematics",
      credits: 4,
      level: "Core",
      prerequisites: ["CS101"],
      minCgpa: 2.5,
      tags: ["#Algorithms", "#DataStructures", "#Logic"],
      description: "Linear and hierarchical data structures, discrete structures, and runtime complexity analysis.",
      status: "Active"
    },
    {
      code: "CS301",
      title: "Artificial Intelligence & Knowledge Representation",
      credits: 3,
      level: "Advanced Core",
      prerequisites: ["CS201"],
      minCgpa: 3.0,
      tags: ["#AI", "#DeepLearning", "#Logic"],
      description: "Heuristic search methods, predicate logic, rule-based systems, and non-monotonic default reasoning.",
      status: "Active"
    },
    {
      code: "CS320",
      title: "Machine Learning & Statistical Pattern Recognition",
      credits: 4,
      level: "Advanced Elective",
      prerequisites: ["CS201"],
      minCgpa: 3.2,
      tags: ["#DeepLearning", "#DataAnalysis", "#AI"],
      description: "Supervised and unsupervised learning, regression models, gradient descent, and neural network foundations.",
      status: "Active"
    },
    {
      code: "CS401",
      title: "Deep Neural Networks & NLP Architectures",
      credits: 4,
      level: "Challenge Track",
      prerequisites: ["CS301", "CS320"],
      minCgpa: 3.5,
      tags: ["#DeepLearning", "#AI", "#NLP"],
      description: "Transformer models, attention mechanisms, convolutional architectures, and generative AI systems.",
      status: "Active"
    },
    {
      code: "CS310",
      title: "Database System Engineering & Query Optimization",
      credits: 3,
      level: "Core Elective",
      prerequisites: ["CS201"],
      minCgpa: 2.8,
      tags: ["#DatabaseOptimization", "#Backend", "#DataAnalysis"],
      description: "Relational database internals, indexing algorithms, transaction semantics, and distributed storage.",
      status: "Active"
    },
    {
      code: "CS350",
      title: "Cloud Infrastructure & Distributed Architectures",
      credits: 4,
      level: "Core Elective",
      prerequisites: ["CS201"],
      minCgpa: 3.0,
      tags: ["#CloudComputing", "#DevOps", "#Backend"],
      description: "Microservices design patterns, containerization, Kubernetes orchestration, and cloud network security.",
      status: "Active"
    },
    {
      code: "CS420",
      title: "Advanced Cloud Security & Zero-Trust DevOps",
      credits: 3,
      level: "Challenge Track",
      prerequisites: ["CS350"],
      minCgpa: 3.4,
      tags: ["#Cybersecurity", "#CloudComputing", "#DevOps"],
      description: "Cryptographic protocols, IAM policies, container runtime security, and automated CI/CD security pipelines.",
      status: "Active"
    },
    {
      code: "CS240",
      title: "Modern Web Engineering & Reactive Frontend Systems",
      credits: 3,
      level: "Core Elective",
      prerequisites: ["CS101"],
      minCgpa: 2.5,
      tags: ["#UIUXDesign", "#Frontend", "#Programming"],
      description: "Component-driven UI architectures, state synchronization, client-side performance, and web accessibility.",
      status: "Active"
    },
    {
      code: "CS360",
      title: "UI/UX System Design & Human-Computer Interaction",
      credits: 3,
      level: "Domain Elective",
      prerequisites: ["CS240"],
      minCgpa: 2.7,
      tags: ["#UIUXDesign", "#Frontend"],
      description: "User research methodologies, wireframing, high-fidelity prototyping, and empirical usability evaluation.",
      status: "Active"
    },
    {
      code: "CS450",
      title: "Distributed Data Pipelines & Big Data Analytics",
      credits: 4,
      level: "Challenge Track",
      prerequisites: ["CS310", "CS320"],
      minCgpa: 3.5,
      tags: ["#DataAnalysis", "#DatabaseOptimization", "#CloudComputing"],
      description: "Real-time streaming pipelines, Apache Spark, distributed ETL systems, and warehouse analytics.",
      status: "Active"
    }
  ],

  // System User Accounts
  users: [
    { id: "STU2024-042", name: "Alex Johnson", role: "student", rollNo: "STU2024-042", dept: "Computer Science", email: "alex.j@student.edu" },
    { id: "STU2024-088", name: "Priya Sharma", role: "student", rollNo: "STU2024-088", dept: "Data Science", email: "priya.s@student.edu" },
    { id: "STU2024-102", name: "David Chen", role: "student", rollNo: "STU2024-102", dept: "Cybersecurity", email: "david.c@student.edu" },
    
    { id: "FAC-108", name: "Dr. Sarah Jenkins", role: "teacher", empId: "FAC-108", dept: "Computer Science", email: "s.jenkins@faculty.edu" },
    { id: "FAC-204", name: "Prof. Michael Vance", role: "teacher", empId: "FAC-204", dept: "Data Science", email: "m.vance@faculty.edu" },

    { id: "ADM-001", name: "Institutional Admin", role: "admin", email: "admin@coursemind.edu" }
  ],

  // Teacher Course Assignments
  teacherAssignments: [
    { teacherId: "FAC-108", courseCode: "CS201", sec: "Section A", year: "2025-2026" },
    { teacherId: "FAC-108", courseCode: "CS301", sec: "Section B", year: "2025-2026" },
    { teacherId: "FAC-204", courseCode: "CS320", sec: "Section A", year: "2025-2026" },
    { teacherId: "FAC-204", courseCode: "CS310", sec: "Section A", year: "2025-2026" }
  ],

  // Student Gradebook Records (Multi-Semester)
  gradebooks: {
    "STU2024-042": [
      {
        semester: "Fall 2024 (Semester 1)",
        records: [
          { courseCode: "CS101", courseTitle: "Introduction to CS & Logic", credits: 4, cie: 28, lab: 18, endSem: 46, total: 92, grade: "A+", gradePoints: 4.0, passed: true },
          { courseCode: "CS240", courseTitle: "Modern Web Engineering", credits: 3, cie: 25, lab: 16, endSem: 41, total: 82, grade: "A", gradePoints: 3.7, passed: true }
        ]
      },
      {
        semester: "Spring 2025 (Semester 2)",
        records: [
          { courseCode: "CS201", courseTitle: "Data Structures & Discrete Math", credits: 4, cie: 26, lab: 17, endSem: 43, total: 86, grade: "A", gradePoints: 3.7, passed: true },
          { courseCode: "CS320", courseTitle: "Machine Learning Foundations", credits: 4, cie: 27, lab: 18, endSem: 44, total: 89, grade: "A", gradePoints: 3.7, passed: true }
        ]
      }
    ],
    "STU2024-088": [
      {
        semester: "Fall 2024 (Semester 1)",
        records: [
          { courseCode: "CS101", courseTitle: "Introduction to CS & Logic", credits: 4, cie: 21, lab: 14, endSem: 35, total: 70, grade: "B+", gradePoints: 3.2, passed: true }
        ]
      },
      {
        semester: "Spring 2025 (Semester 2)",
        records: [
          { courseCode: "CS201", courseTitle: "Data Structures & Discrete Math", credits: 4, cie: 18, lab: 12, endSem: 32, total: 62, grade: "C", gradePoints: 2.2, passed: true }
        ]
      }
    ],
    "STU2024-102": [
      {
        semester: "Fall 2024 (Semester 1)",
        records: [
          { courseCode: "CS101", courseTitle: "Introduction to CS & Logic", credits: 4, cie: 26, lab: 17, endSem: 42, total: 85, grade: "A", gradePoints: 3.7, passed: true }
        ]
      }
    ]
  },

  // Career Track Templates (Default Blueprints)
  careerTracks: [
    {
      id: "ai_researcher",
      title: "AI Research Scientist",
      icon: "fa-brain",
      requiredTags: ["#AI", "#DeepLearning", "#Logic"],
      defaultRecommendedCourses: ["CS301", "CS320", "CS401"]
    },
    {
      id: "cloud_architect",
      title: "Cloud Solutions Architect",
      icon: "fa-cloud-meatball",
      requiredTags: ["#CloudComputing", "#DevOps", "#Cybersecurity"],
      defaultRecommendedCourses: ["CS350", "CS420", "CS310"]
    },
    {
      id: "fullstack_dev",
      title: "Full-Stack Software Engineer",
      icon: "fa-code",
      requiredTags: ["#Frontend", "#Backend", "#UIUXDesign"],
      defaultRecommendedCourses: ["CS240", "CS310", "CS360"]
    },
    {
      id: "data_analyst",
      title: "Data Scientist & Analytics Lead",
      icon: "fa-chart-pie",
      requiredTags: ["#DataAnalysis", "#DatabaseOptimization", "#DeepLearning"],
      defaultRecommendedCourses: ["CS320", "CS310", "CS450"]
    }
  ],

  // Default Reasoning Rules
  defaultRules: [
    {
      ruleId: "DR_AI_01",
      careerId: "ai_researcher",
      targetCourseCode: "CS401",
      explanation: "By default, students targeting AI Research Scientist should take CS401 (Deep Neural Networks) for advanced model architectures."
    },
    {
      ruleId: "DR_AI_02",
      careerId: "ai_researcher",
      targetCourseCode: "CS301",
      explanation: "By default, students pursuing AI careers must complete CS301 (Artificial Intelligence & Logic) as a foundational core requirement."
    },
    {
      ruleId: "DR_CLOUD_01",
      careerId: "cloud_architect",
      targetCourseCode: "CS350",
      explanation: "By default, Cloud Architect aspirants should take CS350 (Cloud Infrastructure) to master containerization and microservices."
    },
    {
      ruleId: "DR_CLOUD_02",
      careerId: "cloud_architect",
      targetCourseCode: "CS420",
      explanation: "By default, Cloud Architect aspirants should enroll in CS420 (Zero-Trust DevOps) for cloud security compliance."
    },
    {
      ruleId: "DR_FULLSTACK_01",
      careerId: "fullstack_dev",
      targetCourseCode: "CS240",
      explanation: "By default, Full-Stack candidates should complete CS240 (Modern Web Engineering) to build web frontend expertise."
    },
    {
      ruleId: "DR_DATA_01",
      careerId: "data_analyst",
      targetCourseCode: "CS450",
      explanation: "By default, Data Science candidates should take CS450 (Distributed Data Pipelines) for big data analytics."
    }
  ],

  // Grade translation utility functions
  calculateScoreDetails(cie, lab, endSem) {
    const total = (parseInt(cie, 10) || 0) + (parseInt(lab, 10) || 0) + (parseInt(endSem, 10) || 0);
    let grade = "F";
    let gradePoints = 0.0;
    let passed = false;

    if (total >= 90) { grade = "A+"; gradePoints = 4.0; passed = true; }
    else if (total >= 80) { grade = "A"; gradePoints = 3.7; passed = true; }
    else if (total >= 70) { grade = "B+"; gradePoints = 3.3; passed = true; }
    else if (total >= 60) { grade = "B"; gradePoints = 3.0; passed = true; }
    else if (total >= 50) { grade = "C"; gradePoints = 2.5; passed = true; }
    else { grade = "F"; gradePoints = 0.0; passed = false; }

    return { total, grade, gradePoints, passed };
  },

  calculateStudentCGPA(rollNo) {
    const semesters = KB_DATA.gradebooks[rollNo] || [];
    let totalPoints = 0;
    let totalCredits = 0;
    const passedCourses = [];

    semesters.forEach(sem => {
      sem.records.forEach(rec => {
        if (rec.passed) {
          passedCourses.push(rec.courseCode);
        }
        totalPoints += rec.gradePoints * rec.credits;
        totalCredits += rec.credits;
      });
    });

    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 3.00;
    return {
      cgpa: parseFloat(cgpa.toFixed(2)),
      totalCredits,
      passedCourses
    };
  }
};
