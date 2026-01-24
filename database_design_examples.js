// DATABASE DESIGN EXAMPLES USING YOUR ACTUAL SYSTEM DATA
// This file demonstrates different approaches with concrete examples

const { students, grades, teachers, courses, teaching_loads } = require('./data');

console.log("=".repeat(80));
console.log("DATABASE DESIGN COMPARISON - USING YOUR ACTUAL SYSTEM DATA");
console.log("=".repeat(80));

// ============================================================================
// 1. CURRENT NORMALIZED APPROACH (Your System)
// ============================================================================

console.log("\n1. CURRENT NORMALIZED APPROACH (Your System)");
console.log("-".repeat(50));

console.log("\n📊 Current Grades Data:");
grades.forEach(grade => {
    const student = students.find(s => s.id === grade.student_id);
    const teacher = teachers.find(t => t.id === grade.teacher_id);
    console.log(`Grade ID ${grade.id}: ${student.name} - ${grade.course_id} = ${grade.grade_value} (Teacher: ${teacher.name})`);
});

// Scenario 1: Teacher John Doe wants to see his students' grades
console.log("\n🎯 Scenario 1: Teacher John Doe (ID: 1) views his students");
const johnTeachingLoads = teaching_loads.filter(tl => tl.teacher_id === 1);
console.log("John's Teaching Loads:", johnTeachingLoads.map(tl => `${tl.course_id} Section ${tl.section}`));

const johnStudentGrades = grades.filter(g => 
    johnTeachingLoads.some(tl => 
        tl.course_id === g.course_id && 
        tl.section === g.section &&
        tl.year_level === g.year_level &&
        tl.program_code === g.program_code
    )
);

console.log("John's Student Grades:");
johnStudentGrades.forEach(grade => {
    const student = students.find(s => s.id === grade.student_id);
    console.log(`  ${student.name} (${student.student_id}) - ${grade.course_id}: ${grade.grade_value}`);
});

// Scenario 2: Get Alice Smith's complete transcript
console.log("\n🎯 Scenario 2: Alice Smith's (ID: 1) Complete Transcript");
const aliceGrades = grades.filter(g => g.student_id === 1);
console.log("Alice's Grades:");
aliceGrades.forEach(grade => {
    const teacher = teachers.find(t => t.id === grade.teacher_id);
    const course = courses.find(c => c.code === grade.course_id);
    console.log(`  ${course ? course.name : grade.course_id}: ${grade.grade_value} (Teacher: ${teacher.name})`);
});

// Scenario 3: Update a grade
console.log("\n🎯 Scenario 3: Update Alice's MATH101 grade from 85 to 87");
const aliceMathGrade = grades.find(g => g.student_id === 1 && g.course_id === 'MATH101');
console.log(`Before: Alice's MATH101 grade = ${aliceMathGrade.grade_value}`);
aliceMathGrade.grade_value = 87;
aliceMathGrade.updated_at = new Date();
console.log(`After: Alice's MATH101 grade = ${aliceMathGrade.grade_value}`);

// ============================================================================
// 2. STUDENT-CENTRIC DESIGN (Document/NoSQL Style)
// ============================================================================

console.log("\n\n2. STUDENT-CENTRIC DESIGN (Document/NoSQL Style)");
console.log("-".repeat(50));

// Transform current data into student-centric format
function createStudentTranscripts() {
    const transcripts = [];
    
    students.forEach(student => {
        const studentGrades = grades.filter(g => g.student_id === student.id);
        
        if (studentGrades.length > 0) {
            const transcript = {
                _id: `transcript_${student.id}_${studentGrades[0].school_year_id}_${studentGrades[0].semester}`,
                student_id: student.id,
                student_name: student.name,
                student_number: student.student_id,
                program_code: student.program_code,
                year_level: student.year_level,
                section: student.section,
                school_level: student.school_level,
                school_year_id: studentGrades[0].school_year_id,
                semester: studentGrades[0].semester,
                
                courses: studentGrades.map(grade => {
                    const teacher = teachers.find(t => t.id === grade.teacher_id);
                    const course = courses.find(c => c.code === grade.course_id);
                    return {
                        course_id: grade.course_id,
                        course_name: course ? course.name : grade.course_id,
                        teacher_id: grade.teacher_id,
                        teacher_name: teacher.name,
                        grade_value: grade.grade_value,
                        section: grade.section,
                        last_updated: grade.updated_at
                    };
                }),
                
                // Computed fields
                gpa: calculateGPA(studentGrades.map(g => g.grade_value)),
                total_courses: studentGrades.length,
                created_at: student.created_at,
                updated_at: new Date()
            };
            
            transcripts.push(transcript);
        }
    });
    
    return transcripts;
}

function calculateGPA(grades) {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + grade, 0);
    return (total / grades.length / 25).toFixed(2); // Convert to 4.0 scale
}

const studentTranscripts = createStudentTranscripts();

console.log("\n📊 Student-Centric Data Structure:");
studentTranscripts.forEach(transcript => {
    console.log(`\nStudent: ${transcript.student_name} (${transcript.student_number})`);
    console.log(`Program: ${transcript.program_code || 'N/A'}, Year: ${transcript.year_level}, Section: ${transcript.section}`);
    console.log(`GPA: ${transcript.gpa}, Total Courses: ${transcript.total_courses}`);
    console.log("Courses:");
    transcript.courses.forEach(course => {
        console.log(`  ${course.course_name}: ${course.grade_value} (${course.teacher_name})`);
    });
});

// Scenario: Get Alice's complete transcript (single query)
console.log("\n🎯 Scenario: Get Alice's Complete Transcript (Single Query)");
const aliceTranscript = studentTranscripts.find(t => t.student_id === 1);
if (aliceTranscript) {
    console.log(`Student: ${aliceTranscript.student_name}`);
    console.log(`GPA: ${aliceTranscript.gpa}`);
    console.log("All Courses:");
    aliceTranscript.courses.forEach(course => {
        console.log(`  ${course.course_name}: ${course.grade_value}`);
    });
}

// ============================================================================
// 3. COURSE-CENTRIC DESIGN (Gradebook Style)
// ============================================================================

console.log("\n\n3. COURSE-CENTRIC DESIGN (Gradebook Style)");
console.log("-".repeat(50));

// Transform current data into course-centric format
function createCourseGradebooks() {
    const gradebooks = [];
    
    teaching_loads.forEach(load => {
        const courseGrades = grades.filter(g => 
            g.course_id === load.course_id && 
            g.section === load.section &&
            g.year_level === load.year_level &&
            g.school_year_id === load.school_year_id &&
            g.semester === load.semester
        );
        
        if (courseGrades.length > 0) {
            const teacher = teachers.find(t => t.id === load.teacher_id);
            const course = courses.find(c => c.code === load.course_id);
            
            const gradebook = {
                _id: `gradebook_${load.course_id}_${load.section}_${load.school_year_id}_${load.semester}`,
                course_id: load.course_id,
                course_name: course ? course.name : load.course_id,
                section: load.section,
                teacher_id: load.teacher_id,
                teacher_name: teacher.name,
                year_level: load.year_level,
                program_code: load.program_code,
                school_level: load.school_level,
                school_year_id: load.school_year_id,
                semester: load.semester,
                
                students: courseGrades.map(grade => {
                    const student = students.find(s => s.id === grade.student_id);
                    return {
                        student_id: grade.student_id,
                        student_name: student.name,
                        student_number: student.student_id,
                        current_grade: grade.grade_value,
                        last_updated: grade.updated_at
                    };
                }),
                
                // Class statistics
                class_stats: {
                    average: calculateAverage(courseGrades.map(g => g.grade_value)),
                    highest: Math.max(...courseGrades.map(g => g.grade_value)),
                    lowest: Math.min(...courseGrades.map(g => g.grade_value)),
                    total_students: courseGrades.length,
                    passing_count: courseGrades.filter(g => g.grade_value >= 75).length,
                    failing_count: courseGrades.filter(g => g.grade_value < 75).length
                },
                
                created_at: load.created_at,
                updated_at: new Date()
            };
            
            gradebooks.push(gradebook);
        }
    });
    
    return gradebooks;
}

function calculateAverage(grades) {
    if (grades.length === 0) return 0;
    return (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(1);
}

const courseGradebooks = createCourseGradebooks();

console.log("\n📊 Course-Centric Data Structure:");
courseGradebooks.forEach(gradebook => {
    console.log(`\nCourse: ${gradebook.course_name} Section ${gradebook.section}`);
    console.log(`Teacher: ${gradebook.teacher_name}`);
    console.log(`Class Average: ${gradebook.class_stats.average}, Students: ${gradebook.class_stats.total_students}`);
    console.log("Students:");
    gradebook.students.forEach(student => {
        console.log(`  ${student.student_name} (${student.student_number}): ${student.current_grade}`);
    });
});

// Scenario: Teacher John wants to see his MATH101 Section A class
console.log("\n🎯 Scenario: John's MATH101 Section A Gradebook");
const johnMathClass = courseGradebooks.find(gb => 
    gb.teacher_id === 1 && gb.course_id === 'MATH101' && gb.section === 'A'
);

if (johnMathClass) {
    console.log(`Course: ${johnMathClass.course_name}`);
    console.log(`Class Average: ${johnMathClass.class_stats.average}`);
    console.log(`Passing Students: ${johnMathClass.class_stats.passing_count}/${johnMathClass.class_stats.total_students}`);
    console.log("Student Grades:");
    johnMathClass.students.forEach(student => {
        console.log(`  ${student.student_name}: ${student.current_grade}`);
    });
}

// ============================================================================
// 4. EVENT SOURCING DESIGN (Audit Trail)
// ============================================================================

console.log("\n\n4. EVENT SOURCING DESIGN (Audit Trail)");
console.log("-".repeat(50));

// Transform current data into event sourcing format
function createGradeEvents() {
    const events = [];
    let eventId = 1;
    
    grades.forEach(grade => {
        const student = students.find(s => s.id === grade.student_id);
        const teacher = teachers.find(t => t.id === grade.teacher_id);
        
        // Simulate initial grade assignment
        events.push({
            id: eventId++,
            event_id: `evt_${String(eventId).padStart(3, '0')}`,
            student_id: grade.student_id,
            student_name: student.name,
            course_id: grade.course_id,
            section: grade.section,
            teacher_id: grade.teacher_id,
            teacher_name: teacher.name,
            event_type: 'grade_assigned',
            grade_value: grade.grade_value,
            previous_value: null,
            reason: 'initial_grade',
            metadata: {
                school_year_id: grade.school_year_id,
                semester: grade.semester,
                program_code: grade.program_code,
                year_level: grade.year_level
            },
            timestamp: grade.created_at
        });
        
        // Simulate a grade update for some students
        if (grade.student_id === 1) { // Alice's grade update
            events.push({
                id: eventId++,
                event_id: `evt_${String(eventId).padStart(3, '0')}`,
                student_id: grade.student_id,
                student_name: student.name,
                course_id: grade.course_id,
                section: grade.section,
                teacher_id: grade.teacher_id,
                teacher_name: teacher.name,
                event_type: 'grade_updated',
                grade_value: 87,
                previous_value: grade.grade_value,
                reason: 'final_calculation',
                metadata: {
                    calculation_method: 'weighted_average',
                    components: {
                        midterm: 85,
                        final: 90,
                        homework: 85
                    }
                },
                timestamp: new Date(grade.updated_at.getTime() + 86400000) // +1 day
            });
        }
    });
    
    return events.sort((a, b) => a.timestamp - b.timestamp);
}

const gradeEvents = createGradeEvents();

console.log("\n📊 Grade Events (Audit Trail):");
gradeEvents.forEach(event => {
    const changeText = event.previous_value ? 
        `${event.previous_value} → ${event.grade_value}` : 
        `assigned ${event.grade_value}`;
    
    console.log(`${event.timestamp.toISOString().slice(0, 19)}: ${event.student_name} - ${event.course_id} ${changeText} (${event.reason}) by ${event.teacher_name}`);
});

// Scenario: Get Alice's MATH101 grade history
console.log("\n🎯 Scenario: Alice's MATH101 Grade History");
const aliceMathHistory = gradeEvents.filter(e => 
    e.student_id === 1 && e.course_id === 'MATH101'
);

console.log("Grade History:");
aliceMathHistory.forEach(event => {
    const change = event.previous_value ? 
        `Changed from ${event.previous_value} to ${event.grade_value}` :
        `Initial grade: ${event.grade_value}`;
    console.log(`  ${event.timestamp.toLocaleDateString()}: ${change} (${event.reason})`);
});

// Get current grades from events (materialized view)
console.log("\n🎯 Current Grades (Computed from Events):");
const currentGrades = {};

gradeEvents.forEach(event => {
    const key = `${event.student_id}_${event.course_id}`;
    if (!currentGrades[key] || event.timestamp > currentGrades[key].timestamp) {
        currentGrades[key] = {
            student_id: event.student_id,
            student_name: event.student_name,
            course_id: event.course_id,
            current_grade: event.grade_value,
            last_updated: event.timestamp,
            last_updated_by: event.teacher_name
        };
    }
});

Object.values(currentGrades).forEach(grade => {
    console.log(`${grade.student_name} - ${grade.course_id}: ${grade.current_grade} (updated by ${grade.last_updated_by})`);
});

// ============================================================================
// PERFORMANCE COMPARISON
// ============================================================================

console.log("\n\n" + "=".repeat(80));
console.log("PERFORMANCE COMPARISON WITH YOUR DATA");
console.log("=".repeat(80));

console.log("\n📈 Query Performance Analysis:");

console.log("\n1. Get Alice's Transcript:");
console.log("   Normalized: 1 filter operation on grades array");
console.log("   Student-Centric: 1 find operation on transcripts array");
console.log("   Course-Centric: Multiple find operations across gradebooks");
console.log("   Event Sourcing: Filter + aggregation to compute current state");

console.log("\n2. Get John's Class (MATH101 Section A):");
console.log("   Normalized: Filter grades + join with students");
console.log("   Student-Centric: Complex aggregation across multiple transcripts");
console.log("   Course-Centric: 1 find operation on gradebooks");
console.log("   Event Sourcing: Filter events + compute current state");

console.log("\n3. Update a Single Grade:");
console.log("   Normalized: Direct update of 1 record");
console.log("   Student-Centric: Update nested document + recalculate GPA");
console.log("   Course-Centric: Update nested student in gradebook");
console.log("   Event Sourcing: Append new event + update materialized view");

console.log("\n📊 Storage Comparison (with your 6 grade records):");
console.log("   Normalized: 6 grade records");
console.log("   Student-Centric: 5 transcript documents (grouped by student)");
console.log("   Course-Centric: 6 gradebook documents (one per course-section)");
console.log("   Event Sourcing: 7 events (6 initial + 1 update example)");

console.log("\n" + "=".repeat(80));
console.log("CONCLUSION: Your normalized approach handles this data efficiently!");
console.log("=".repeat(80));