/**
 * Default Reasoning Engine
 * Evaluates Non-Monotonic Default Logic & Defeater Exceptions against live student gradebooks.
 */
class ReasoningEngine {
  constructor(kbData) {
    this.kb = kbData;
  }

  /**
   * Evaluates all courses against student profile & gradebook data
   * @param {Object} studentInput - { rollNo, cgpa, targetCredits, careerGoalId, interests: { tag: weight } }
   * @returns {Object} Categorized recommendations & logic trace details
   */
  evaluateStudent(studentInput) {
    // Dynamically pull latest published gradebook metrics if student rollNo exists
    let liveMetrics = { cgpa: studentInput.cgpa, passedCourses: studentInput.passedCourses || [] };
    if (studentInput.rollNo && this.kb.gradebooks[studentInput.rollNo]) {
      const calc = this.kb.calculateStudentCGPA(studentInput.rollNo);
      liveMetrics = {
        cgpa: calc.cgpa,
        passedCourses: Array.from(new Set([...(studentInput.passedCourses || []), ...calc.passedCourses]))
      };
    }

    const currentStudent = {
      ...studentInput,
      cgpa: liveMetrics.cgpa,
      passedCourses: liveMetrics.passedCourses
    };

    const primaryTrack = [];
    const alternativeDomain = [];
    const highChallenge = [];
    const overriddenExcluded = [];

    const activeCareerTrack = this.kb.careerTracks.find(t => t.id === currentStudent.careerGoalId) || this.kb.careerTracks[0];

    this.kb.courses.forEach(course => {
      if (course.status !== "Active") return;

      // Calculate raw interest alignment (0-100)
      let interestScore = 0;
      let matchedTagsCount = 0;

      course.tags.forEach(tag => {
        if (currentStudent.interests && currentStudent.interests[tag]) {
          interestScore += currentStudent.interests[tag] * 20; // 1-5 scale mapped to 20-100
          matchedTagsCount++;
        }
      });

      const avgInterestScore = matchedTagsCount > 0 ? (interestScore / matchedTagsCount) : 40;

      // Check if recommended by default career track rule
      const defaultRuleMatch = this.kb.defaultRules.find(
        r => r.careerId === activeCareerTrack.id && r.targetCourseCode === course.code
      );

      const isTrackDefault = activeCareerTrack.defaultRecommendedCourses.includes(course.code) || !!defaultRuleMatch;

      // Evaluate Defeaters (Exceptions)
      const activeDefeaters = [];

      // Check prerequisite defeater against teacher-published grades
      const missingPrereqs = course.prerequisites.filter(p => !currentStudent.passedCourses.includes(p));
      if (missingPrereqs.length > 0) {
        activeDefeaters.push({
          type: "PREREQUISITE_MISSING",
          detail: `Missing prerequisites: ${missingPrereqs.join(", ")}`,
          missing: missingPrereqs,
          negationReason: `Default Rule Negated: Recommended for ${activeCareerTrack.title} path, but prerequisite (${missingPrereqs.join(", ")}) is missing from faculty gradebook.`,
          remediation: `Enroll in and clear ${missingPrereqs.join(", ")} in upcoming terms to satisfy prerequisite requirements.`
        });
      }

      // Check CGPA cutoff defeater against calculated CGPA
      if (currentStudent.cgpa < course.minCgpa) {
        activeDefeaters.push({
          type: "CGPA_BELOW_CUTOFF",
          detail: `Cumulative CGPA ${currentStudent.cgpa.toFixed(2)} < minimum cutoff ${course.minCgpa.toFixed(2)}`,
          minCgpa: course.minCgpa,
          actualCgpa: currentStudent.cgpa,
          negationReason: `Default Rule Override: Course requires a minimum CGPA of ${course.minCgpa.toFixed(2)}, but current cumulative CGPA is ${currentStudent.cgpa.toFixed(2)}.`,
          remediation: `Improve overall academic performance to CGPA ≥ ${course.minCgpa.toFixed(2)} to unlock ${course.code}.`
        });
      }

      // Check if course is already passed
      const alreadyPassed = currentStudent.passedCourses.includes(course.code);

      // Compute Final Match Score percentage
      let matchScore = avgInterestScore;
      if (isTrackDefault) matchScore += 30;
      if (missingPrereqs.length === 0) matchScore += 15;
      if (currentStudent.cgpa >= course.minCgpa) matchScore += 15;
      matchScore = Math.min(Math.round(matchScore), 99);

      // Build Logic Inspector Trace
      const logicTrace = {
        courseCode: course.code,
        courseTitle: course.title,
        defaultAssumption: isTrackDefault
          ? (defaultRuleMatch ? defaultRuleMatch.explanation : `Recommended by default rule for ${activeCareerTrack.title} blueprint.`)
          : `General elective matching interest tags (${course.tags.join(', ')}).`,
        hasDefaultRule: isTrackDefault,
        defeaterChecks: [
          {
            name: "Faculty Gradebook CGPA Check",
            passed: currentStudent.cgpa >= course.minCgpa,
            detail: `Required: ≥ ${course.minCgpa.toFixed(2)} | Calculated CGPA: ${currentStudent.cgpa.toFixed(2)}`
          },
          {
            name: "Prerequisite Verification",
            passed: missingPrereqs.length === 0,
            detail: missingPrereqs.length === 0 ? "All prerequisites verified in gradebook" : `Missing: ${missingPrereqs.join(', ')}`
          },
          {
            name: "Career Blueprint Alignment",
            passed: isTrackDefault,
            detail: isTrackDefault ? `Matched default path: ${activeCareerTrack.title}` : "Elective outside primary career track"
          }
        ],
        finalDecision: activeDefeaters.length === 0
          ? `Default recommendation holds true. All defeater checks passed cleanly.`
          : `Default recommendation modified due to ${activeDefeaters.length} active exception(s).`,
        activeDefeaters: activeDefeaters
      };

      const resultObject = {
        course,
        matchScore,
        isTrackDefault,
        activeDefeaters,
        alreadyPassed,
        logicTrace,
        defaultRuleSummary: isTrackDefault
          ? (defaultRuleMatch ? defaultRuleMatch.explanation : `Recommended by default for the ${activeCareerTrack.title} career track.`)
          : `Recommended based on your interest alignment in ${course.tags.slice(0, 2).join(' & ')}.`
      };

      if (alreadyPassed) {
        return; // Exclude completed courses from elective recommendations
      }

      if (activeDefeaters.length > 0 && isTrackDefault) {
        overriddenExcluded.push(resultObject);
      } else if (activeDefeaters.length === 0 && isTrackDefault) {
        primaryTrack.push(resultObject);
      } else if (course.level === "Challenge Track" || course.minCgpa >= 3.4) {
        highChallenge.push(resultObject);
      } else {
        alternativeDomain.push(resultObject);
      }
    });

    primaryTrack.sort((a, b) => b.matchScore - a.matchScore);
    alternativeDomain.sort((a, b) => b.matchScore - a.matchScore);
    highChallenge.sort((a, b) => b.matchScore - a.matchScore);
    overriddenExcluded.sort((a, b) => b.matchScore - a.matchScore);

    return {
      studentMetrics: currentStudent,
      primaryTrack,
      alternativeDomain,
      highChallenge,
      overriddenExcluded,
      activeCareerTrack
    };
  }
}
