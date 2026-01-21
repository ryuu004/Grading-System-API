const express = require("express");
const app = express();
const { teachers, grades, students } = require('./data');
const { authenticate, getTeachingLoads, canAccessGrade, logAudit } = require('./auth');

app.use(express.json());
app.use(express.static('public'));

app.get("/", (req, res) => {
  res.json({ message: "Teacher API Simulation running" });
});

app.post("/login", (req, res) => {
  const { api_key } = req.body;
  if (!api_key) {
    return res.status(400).json({ error: 'API key required' });
  }
  const teacher = teachers.find(t => t.api_key === api_key && t.active && new Date(t.expiration_date) > new Date());
  if (!teacher) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }
  // Return teacher info without api_key
  const { api_key: _, ...teacherInfo } = teacher;
  res.json({ teacher: teacherInfo });
});

// Protected routes
app.get("/teaching-loads", authenticate, (req, res) => {
  const loads = getTeachingLoads(req.teacher.id);
  logAudit(req.teacher.id, 'view_teaching_loads', {});
  console.log('Response:', JSON.stringify(loads, null, 2));
  res.json(loads);
});

app.get("/grades", authenticate, (req, res) => {
  const { school_year_id, semester, program_code, year_level, section, course_id } = req.query;
  const loads = getTeachingLoads(req.teacher.id);
  // Filter grades based on teaching loads
  let filteredGrades = grades.filter(g =>
    loads.some(tl =>
      tl.course_id === g.course_id &&
      tl.section === g.section &&
      tl.year_level === g.year_level &&
      tl.program_code === g.program_code &&
      tl.school_year_id === g.school_year_id &&
      tl.semester === g.semester
    )
  );
  // Apply optional filters
  if (school_year_id) filteredGrades = filteredGrades.filter(g => g.school_year_id == school_year_id);
  if (semester) filteredGrades = filteredGrades.filter(g => g.semester == semester);
  if (program_code) filteredGrades = filteredGrades.filter(g => g.program_code === program_code);
  if (year_level) filteredGrades = filteredGrades.filter(g => g.year_level == year_level);
  if (section) filteredGrades = filteredGrades.filter(g => g.section === section);
  if (course_id) filteredGrades = filteredGrades.filter(g => g.course_id === course_id);

  // Join with students for names
  const result = filteredGrades.map(g => {
    const student = students.find(s => s.id === g.student_id);
    return {
      student_id: g.student_id,
      course_id: g.course_id,
      grade: g.grade_value,
      school_year_id: g.school_year_id,
      semester: g.semester,
      program_code: g.program_code,
      year_level: g.year_level,
      section: g.section,
      student_name: student ? student.name : 'Unknown'
    };
  });

  // Metadata
  const total_students = new Set(filteredGrades.map(g => g.student_id)).size;
  const total_courses = new Set(filteredGrades.map(g => g.course_id)).size;

  const response = {
    grades: result,
    metadata: {
      total_students,
      total_courses
    }
  };

  logAudit(req.teacher.id, 'view_grades', { filters: req.query });
  console.log('Response:', JSON.stringify(response, null, 2));
  res.json(response);
});

app.post("/grades", authenticate, (req, res) => {
  const { id, grade_value } = req.body;
  if (!id || grade_value === undefined) {
    return res.status(400).json({ error: 'Grade id and grade_value required' });
  }
  const grade = grades.find(g => g.id === id);
  if (!grade) {
    return res.status(404).json({ error: 'Grade not found' });
  }
  // Validate access
  if (!canAccessGrade(req.teacher.id, grade.course_id, grade.section, grade.year_level, grade.program_code, grade.school_year_id, grade.semester)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  // Update grade
  grade.grade_value = grade_value;
  grade.updated_at = new Date();
  grade.teacher_id = req.teacher.id; // Update the teacher who entered
  logAudit(req.teacher.id, 'update_grade', { grade_id: id, new_value: grade_value });
  res.json({ message: 'Grade updated successfully', grade });
});


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
