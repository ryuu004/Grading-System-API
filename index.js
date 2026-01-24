const express = require("express");
const app = express();
const { teachers, admins, courses, programs, school_years, teaching_loads, grades, students } = require('./data');
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
  if (teacher) {
    const { api_key: _, ...teacherInfo } = teacher;
    return res.json({ user: { type: 'teacher', ...teacherInfo } });
  }
  const admin = admins.find(a => a.api_key === api_key && a.active && new Date(a.expiration_date) > new Date());
  if (admin) {
    const { api_key: _, ...adminInfo } = admin;
    return res.json({ user: { type: 'admin', ...adminInfo } });
  }
  return res.status(401).json({ error: 'Invalid or expired API key' });
});

// Protected routes
app.get("/teaching-loads", authenticate, (req, res) => {
  let loads;
  if (req.user.type === 'teacher') {
    loads = getTeachingLoads(req.user.data.id);
  } else if (req.user.type === 'admin') {
    loads = teaching_loads.filter(tl => tl.is_active); // Admins can see all active
  }
  // Apply filters for both teachers and admins
  const { school_year_id, school_level, program_code, year_level, section, teacher_id, course_id } = req.query;
  if (school_year_id) loads = loads.filter(tl => tl.school_year_id == school_year_id);
  if (school_level) loads = loads.filter(tl => tl.school_level === school_level);
  if (program_code) loads = loads.filter(tl => tl.program_code === program_code);
  if (year_level) loads = loads.filter(tl => tl.year_level == year_level);
  if (section) loads = loads.filter(tl => tl.section === section);
  if (teacher_id) loads = loads.filter(tl => tl.teacher_id == teacher_id);
  if (course_id) loads = loads.filter(tl => tl.course_id === course_id);
  // Pagination (for admins, since teachers might not need it, but apply anyway)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const paginatedLoads = loads.slice(start, start + limit);
  // Sorting, simple by id
  paginatedLoads.sort((a, b) => a.id - b.id);
  loads = paginatedLoads;
  logAudit(req.user, 'view_teaching_loads', { filters: req.query });
  console.log('Response:', JSON.stringify(loads, null, 2));
  res.json(loads);
});

app.post("/teaching-loads", authenticate, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { teacher_id, course_id, section, year_level, program_code, school_level, school_year_id, semester, role } = req.body;
  if (!teacher_id || !course_id || !section || !year_level || !school_level || !school_year_id || !semester || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }
  // Validate existence
  const teacher = teachers.find(t => t.id === teacher_id);
  if (!teacher) return res.status(400).json({ error: 'Teacher not found' });
  const course = courses.find(c => c.code === course_id);
  if (!course) return res.status(400).json({ error: 'Course not found' });
  const schoolYear = school_years.find(sy => sy.id === school_year_id);
  if (!schoolYear) return res.status(400).json({ error: 'School year not found' });
  if (program_code) {
    const program = programs.find(p => p.code === program_code);
    if (!program) return res.status(400).json({ error: 'Program not found' });
  }
  // Check for duplicate
  const existing = teaching_loads.find(tl =>
    tl.teacher_id === teacher_id &&
    tl.course_id === course_id &&
    tl.section === section &&
    tl.year_level === year_level &&
    tl.program_code === program_code &&
    tl.school_level === school_level &&
    tl.school_year_id === school_year_id &&
    tl.semester === semester &&
    tl.is_active
  );
  if (existing) return res.status(400).json({ error: 'Duplicate teaching load' });
  // Create
  const newLoad = {
    id: teaching_loads.length + 1,
    teacher_id,
    course_id,
    section,
    year_level,
    program_code,
    school_level,
    school_year_id,
    semester,
    role,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };
  teaching_loads.push(newLoad);
  logAudit(req.user, 'create_teaching_load', { load_id: newLoad.id });
  res.json({ message: 'Teaching load created', load: newLoad });
});

app.put("/teaching-loads/:id", authenticate, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const id = parseInt(req.params.id);
  const load = teaching_loads.find(tl => tl.id === id);
  if (!load) return res.status(404).json({ error: 'Teaching load not found' });
  // Update fields, similar validation
  const { teacher_id, course_id, section, year_level, program_code, school_level, school_year_id, semester, role, is_active } = req.body;
  if (teacher_id) {
    const teacher = teachers.find(t => t.id === teacher_id);
    if (!teacher) return res.status(400).json({ error: 'Teacher not found' });
    load.teacher_id = teacher_id;
  }
  if (course_id) {
    const course = courses.find(c => c.code === course_id);
    if (!course) return res.status(400).json({ error: 'Course not found' });
    load.course_id = course_id;
  }
  if (school_year_id) {
    const schoolYear = school_years.find(sy => sy.id === school_year_id);
    if (!schoolYear) return res.status(400).json({ error: 'School year not found' });
    load.school_year_id = school_year_id;
  }
  if (program_code) {
    const program = programs.find(p => p.code === program_code);
    if (!program) return res.status(400).json({ error: 'Program not found' });
    load.program_code = program_code;
  }
  if (section) load.section = section;
  if (year_level) load.year_level = year_level;
  if (school_level) load.school_level = school_level;
  if (semester) load.semester = semester;
  if (role) load.role = role;
  if (is_active !== undefined) load.is_active = is_active;
  load.updated_at = new Date();
  logAudit(req.user, 'update_teaching_load', { load_id: id });
  res.json({ message: 'Teaching load updated', load });
});

app.delete("/teaching-loads/:id", authenticate, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const id = parseInt(req.params.id);
  const load = teaching_loads.find(tl => tl.id === id);
  if (!load) return res.status(404).json({ error: 'Teaching load not found' });
  load.is_active = false;
  load.updated_at = new Date();
  logAudit(req.user, 'deactivate_teaching_load', { load_id: id });
  res.json({ message: 'Teaching load deactivated' });
});

app.get("/grades", authenticate, (req, res) => {
  const { school_year_id, semester, program_code, year_level, section, course_id, teacher_id } = req.query;
  let filteredGrades;
  if (req.user.type === 'teacher') {
    const loads = getTeachingLoads(req.user.data.id);
    // Filter grades based on teaching loads
    filteredGrades = grades.filter(g =>
      loads.some(tl =>
        tl.course_id === g.course_id &&
        tl.section === g.section &&
        tl.year_level === g.year_level &&
        tl.program_code === g.program_code &&
        tl.school_level === g.school_level &&
        tl.school_year_id === g.school_year_id &&
        tl.semester === g.semester
      )
    );
  } else if (req.user.type === 'admin') {
    filteredGrades = grades; // Admins can see all
  }
  // Apply optional filters
  if (school_year_id) filteredGrades = filteredGrades.filter(g => g.school_year_id == school_year_id);
  if (semester) filteredGrades = filteredGrades.filter(g => g.semester == semester);
  if (program_code) filteredGrades = filteredGrades.filter(g => g.program_code === program_code);
  if (year_level) filteredGrades = filteredGrades.filter(g => g.year_level == year_level);
  if (section) filteredGrades = filteredGrades.filter(g => g.section === section);
  if (course_id) filteredGrades = filteredGrades.filter(g => g.course_id === course_id);
  if (teacher_id) filteredGrades = filteredGrades.filter(g => g.teacher_id == teacher_id);

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
      school_level: g.school_level,
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

  logAudit(req.user, 'view_grades', { filters: req.query });
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
  if (req.user.type === 'teacher' && !canAccessGrade(req.user.data.id, grade.course_id, grade.section, grade.year_level, grade.program_code, grade.school_level, grade.school_year_id, grade.semester)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  // Update grade
  grade.grade_value = grade_value;
  grade.updated_at = new Date();
  grade.teacher_id = req.user.data.id; // Update the user who entered
  logAudit(req.user, 'update_grade', { grade_id: id, new_value: grade_value });
  res.json({ message: 'Grade updated successfully', grade });
});


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
