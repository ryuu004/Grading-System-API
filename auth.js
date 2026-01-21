const { teachers, admins, teaching_loads, audit_logs } = require('./data');

// Simple auth: check API key in header for teachers and admins
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  const teacher = teachers.find(t => t.api_key === apiKey && t.active && new Date(t.expiration_date) > new Date());
  if (teacher) {
    req.user = { type: 'teacher', data: teacher };
    return next();
  }
  const admin = admins.find(a => a.api_key === apiKey && a.active && new Date(a.expiration_date) > new Date());
  if (admin) {
    req.user = { type: 'admin', data: admin };
    return next();
  }
  return res.status(401).json({ error: 'Invalid or expired API key' });
}

// Authorization: get allowed loads for teacher
function getTeachingLoads(teacherId) {
  return teaching_loads.filter(tl => tl.teacher_id === teacherId && tl.is_active);
}

// Check if teacher can access specific grade context
function canAccessGrade(teacherId, course_id, section, year_level, program_code, school_level, school_year_id, semester) {
  const loads = getTeachingLoads(teacherId);
  return loads.some(tl =>
    tl.course_id === course_id &&
    tl.section === section &&
    tl.year_level === year_level &&
    tl.program_code === program_code &&
    tl.school_level === school_level &&
    tl.school_year_id === school_year_id &&
    tl.semester === semester
  );
}

// Log audit
function logAudit(user, action, details) {
  const logEntry = {
    id: audit_logs.length + 1,
    action,
    details,
    timestamp: new Date()
  };
  if (user.type === 'teacher') {
    logEntry.teacher_id = user.data.id;
    console.log(`Audit: ${action} by teacher ${user.data.id}`, details);
  } else if (user.type === 'admin') {
    logEntry.admin_id = user.data.id;
    console.log(`Audit: ${action} by admin ${user.data.id}`, details);
  }
  audit_logs.push(logEntry);
}

module.exports = {
  authenticate,
  getTeachingLoads,
  canAccessGrade,
  logAudit
};