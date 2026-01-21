const { teachers, teaching_loads, audit_logs } = require('./data');

// Simple auth: check API key in header
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  const teacher = teachers.find(t => t.api_key === apiKey && t.active && new Date(t.expiration_date) > new Date());
  if (!teacher) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }
  req.teacher = teacher;
  next();
}

// Authorization: get allowed loads for teacher
function getTeachingLoads(teacherId) {
  return teaching_loads.filter(tl => tl.teacher_id === teacherId && tl.is_active);
}

// Check if teacher can access specific grade context
function canAccessGrade(teacherId, course_id, section, year_level, program_code, school_year_id, semester) {
  const loads = getTeachingLoads(teacherId);
  return loads.some(tl =>
    tl.course_id === course_id &&
    tl.section === section &&
    tl.year_level === year_level &&
    tl.program_code === program_code &&
    tl.school_year_id === school_year_id &&
    tl.semester === semester
  );
}

// Log audit
function logAudit(teacherId, action, details) {
  audit_logs.push({
    id: audit_logs.length + 1,
    teacher_id: teacherId,
    action,
    details,
    timestamp: new Date()
  });
  console.log(`Audit: ${action} by teacher ${teacherId}`, details);
}

module.exports = {
  authenticate,
  getTeachingLoads,
  canAccessGrade,
  logAudit
};