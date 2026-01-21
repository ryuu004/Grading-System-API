// Mock database simulation using in-memory arrays

const school_years = [
  {
    id: 1,
    year: '2023-2024',
    start_date: '2023-08-01',
    end_date: '2024-05-31'
  },
  {
    id: 2,
    year: '2024-2025',
    start_date: '2024-08-01',
    end_date: '2025-05-31'
  }
];

const courses = [
  { id: 1, code: 'MATH101', name: 'Mathematics 101' },
  { id: 2, code: 'CS101', name: 'Computer Science 101' },
  { id: 3, code: 'ENG101', name: 'English 101' },
  { id: 4, code: 'HIST101', name: 'History 101' },
  { id: 5, code: 'SCIENCE', name: 'Science' },
  { id: 6, code: 'MATH', name: 'Mathematics' }
];

const programs = [
  { code: 'CS', name: 'Computer Science' },
  { code: 'BA', name: 'Business Administration' }
];

const teachers = [
  {
    id: 1,
    name: 'John Doe',
    api_key: 'hashed_key_1', // In real, hash it
    active: true,
    expiration_date: '2027-01-01',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'Jane Smith',
    api_key: 'hashed_key_2',
    active: true,
    expiration_date: '2027-01-01',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'Bob Johnson',
    api_key: 'hashed_key_3',
    active: true,
    expiration_date: '2027-01-01',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const admins = [
  {
    id: 1,
    name: 'Admin User',
    api_key: 'admin_key_1',
    active: true,
    expiration_date: '2027-01-01',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const teaching_loads = [
  {
    id: 1,
    teacher_id: 1,
    course_id: 'MATH101',
    section: 'A',
    year_level: 1,
    program_code: 'CS',
    school_level: 'COLLEGE',
    school_year_id: 1,
    semester: 1,
    role: 'subject_teacher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    teacher_id: 1,
    course_id: 'CS101',
    section: 'B',
    year_level: 1,
    program_code: 'CS',
    school_level: 'COLLEGE',
    school_year_id: 1,
    semester: 1,
    role: 'subject_teacher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    teacher_id: 2,
    course_id: 'ENG101',
    section: 'A',
    year_level: 2,
    program_code: 'BA',
    school_level: 'COLLEGE',
    school_year_id: 1,
    semester: 2,
    role: 'subject_teacher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    teacher_id: 2,
    course_id: 'HIST101',
    section: 'A',
    year_level: 2,
    program_code: 'BA',
    school_level: 'COLLEGE',
    school_year_id: 1,
    semester: 2,
    role: 'adviser',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    teacher_id: 3,
    course_id: 'SCIENCE',
    section: '1',
    year_level: 7,
    program_code: null,
    school_level: 'K-12',
    school_year_id: 1,
    semester: 0,
    role: 'subject_teacher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    teacher_id: 3,
    course_id: 'MATH',
    section: '1',
    year_level: 7,
    program_code: null,
    school_level: 'K-12',
    school_year_id: 1,
    semester: 0,
    role: 'adviser',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const students = [
  {
    id: 1,
    name: 'Alice Smith',
    student_id: 'S001',
    program_code: 'CS',
    year_level: 1,
    section: 'A',
    school_level: 'COLLEGE',
    year_code: 'COL-1',
    created_at: new Date()
  },
  {
    id: 2,
    name: 'Bob Johnson',
    student_id: 'S002',
    program_code: 'CS',
    year_level: 1,
    section: 'B',
    school_level: 'COLLEGE',
    year_code: 'COL-1',
    created_at: new Date()
  },
  {
    id: 3,
    name: 'Charlie Brown',
    student_id: 'S003',
    program_code: 'BA',
    year_level: 2,
    section: 'A',
    school_level: 'COLLEGE',
    year_code: 'COL-2',
    created_at: new Date()
  },
  {
    id: 4,
    name: 'Diana Prince',
    student_id: 'S004',
    program_code: null,
    year_level: 7,
    section: '1',
    school_level: 'K-12',
    year_code: 'K12-7',
    created_at: new Date()
  },
  {
    id: 5,
    name: 'Eve Adams',
    student_id: 'S005',
    program_code: null,
    year_level: 7,
    section: '1',
    school_level: 'K-12',
    year_code: 'K12-7',
    created_at: new Date()
  }
];

const grades = [
  {
    id: 1,
    student_id: 1,
    course_id: 'MATH101',
    section: 'A',
    year_level: 1,
    program_code: 'CS',
    school_level: 'COLLEGE',
    year_code: 'COL-1',
    school_year_id: 1,
    semester: 1,
    grade_value: 85,
    teacher_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    student_id: 2,
    course_id: 'CS101',
    section: 'B',
    year_level: 1,
    program_code: 'CS',
    school_level: 'COLLEGE',
    year_code: 'COL-1',
    school_year_id: 1,
    semester: 1,
    grade_value: 90,
    teacher_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    student_id: 3,
    course_id: 'ENG101',
    section: 'A',
    year_level: 2,
    program_code: 'BA',
    school_level: 'COLLEGE',
    year_code: 'COL-2',
    school_year_id: 1,
    semester: 2,
    grade_value: 88,
    teacher_id: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    student_id: 3,
    course_id: 'HIST101',
    section: 'A',
    year_level: 2,
    program_code: 'BA',
    school_level: 'COLLEGE',
    year_code: 'COL-2',
    school_year_id: 1,
    semester: 2,
    grade_value: 92,
    teacher_id: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    student_id: 4,
    course_id: 'SCIENCE',
    section: '1',
    year_level: 7,
    program_code: null,
    school_level: 'K-12',
    year_code: 'K12-7',
    school_year_id: 1,
    semester: 0,
    grade_value: 87,
    teacher_id: 3,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    student_id: 5,
    course_id: 'MATH',
    section: '1',
    year_level: 7,
    program_code: null,
    school_level: 'K-12',
    year_code: 'K12-7',
    school_year_id: 1,
    semester: 0,
    grade_value: 95,
    teacher_id: 3,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const audit_logs = []; // Array to push logs

module.exports = {
  school_years,
  teachers,
  admins,
  courses,
  programs,
  teaching_loads,
  students,
  grades,
  audit_logs
};