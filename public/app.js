let apiKey = '';

function displayRequestUrl(method, url, description = '') {
    const requestDiv = document.querySelector('.request');
    const existingUrl = requestDiv.querySelector('.request-url');
    if (existingUrl) {
        existingUrl.remove();
    }
    
    const urlDiv = document.createElement('div');
    urlDiv.className = 'request-url';
    urlDiv.innerHTML = `<span class="method-badge">${method}</span>${url}${description ? ` - ${description}` : ''}`;
    
    const form = requestDiv.querySelector('.form-section:not([style*="display: none"])');
    if (form) {
        form.appendChild(urlDiv);
    }
}

function setResponse(text, highlights = {}) {
    const codeElement = document.querySelector('#response code');
    if (Object.keys(highlights).length > 0) {
        // Modify text to add spans for highlights
        let modified = text;
        for (const [key, value] of Object.entries(highlights)) {
            // Replace "key": value with <span class="highlight">"key": value</span>
            let regex;
            if (!isNaN(value)) {
                // Numeric value
                regex = new RegExp(`("${key}":\\s*${value})`, 'g');
            } else {
                // String value
                regex = new RegExp(`("${key}":\\s*"${value}")`, 'g');
            }
            modified = modified.replace(regex, `<span class="highlight">$1</span>`);
        }
        codeElement.innerHTML = modified;
        // Do not call Prism.highlightElement to preserve custom highlights
    } else {
        codeElement.textContent = text;
        Prism.highlightElement(codeElement);
    }
}

function showForm(formId) {
    const forms = document.querySelectorAll('.form-section');
    forms.forEach(form => form.style.display = 'none');
    document.getElementById(formId).style.display = 'block';

    const buttons = document.querySelectorAll('.sidebar button');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(formId.replace('Form', 'Btn')).classList.add('active');
}

document.getElementById('loginBtn').addEventListener('click', () => showForm('loginForm'));
document.getElementById('loadsBtn').addEventListener('click', async () => {
    if (!apiKey) {
        alert('Login first');
        return;
    }
    // Fetch teaching loads and populate dropdowns
    try {
        displayRequestUrl('GET', '/teaching-loads', 'Fetching data for dropdowns');
        const res = await fetch('/teaching-loads', {
            headers: { 'x-api-key': apiKey }
        });
        const loads = await res.json();
        if (res.ok) {
            populateLoadsDropdowns(loads);
            showForm('loadsForm');
            // Clear the request URL display when switching to loads form
            setTimeout(() => {
                const requestDiv = document.querySelector('.request');
                const existingUrl = requestDiv.querySelector('.request-url');
                if (existingUrl) {
                    existingUrl.remove();
                }
            }, 100);
        } else {
            alert('Failed to load teaching loads');
        }
    } catch (err) {
        alert('Error loading loads: ' + err.message);
    }
});
document.getElementById('endpointsBtn').addEventListener('click', () => showForm('endpointsForm'));
document.getElementById('gradesBtn').addEventListener('click', async () => {
    if (!apiKey) {
        alert('Login first');
        return;
    }
    // Fetch teaching loads and populate dropdowns
    try {
        displayRequestUrl('GET', '/teaching-loads', 'Fetching data for dropdowns');
        const res = await fetch('/teaching-loads', {
            headers: { 'x-api-key': apiKey }
        });
        const loads = await res.json();
        if (res.ok) {
            populateDropdowns(loads);
            showForm('gradesForm');
            // Clear the request URL display when switching to grades form
            setTimeout(() => {
                const requestDiv = document.querySelector('.request');
                const existingUrl = requestDiv.querySelector('.request-url');
                if (existingUrl) {
                    existingUrl.remove();
                }
            }, 100);
        } else {
            alert('Failed to load teaching loads');
        }
    } catch (err) {
        alert('Error loading loads: ' + err.message);
    }
});

// Show login by default
showForm('loginForm');

function populateDropdowns(loads) {
    const schoolYearSelect = document.getElementById('schoolYearId');
    const semesterSelect = document.getElementById('semester');
    const programCodeSelect = document.getElementById('programCode');
    const yearLevelSelect = document.getElementById('yearLevel');
    const sectionSelect = document.getElementById('section');
    const courseIdSelect = document.getElementById('courseId');

    // Clear existing options except "All"
    [schoolYearSelect, semesterSelect, programCodeSelect, yearLevelSelect, sectionSelect, courseIdSelect].forEach(select => {
        select.innerHTML = '<option value="">All</option>';
        select.parentElement.classList.remove('active-filter');
    });

    // Get unique values
    const schoolYears = [...new Set(loads.map(l => l.school_year_id))];
    const semesters = [...new Set(loads.map(l => l.semester))];
    const programCodes = [...new Set(loads.map(l => l.program_code).filter(p => p))];
    const yearLevels = [...new Set(loads.map(l => l.year_level))];
    const sections = [...new Set(loads.map(l => l.section))];
    const courseIds = [...new Set(loads.map(l => l.course_id))];

    // Populate
    schoolYears.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id; // Or map to year string if needed
        schoolYearSelect.appendChild(option);
    });
    semesters.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = s;
        semesterSelect.appendChild(option);
    });
    programCodes.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        programCodeSelect.appendChild(option);
    });
    yearLevels.forEach(yl => {
        const option = document.createElement('option');
        option.value = yl;
        option.textContent = yl;
        yearLevelSelect.appendChild(option);
    });
    sections.forEach(sec => {
        const option = document.createElement('option');
        option.value = sec;
        option.textContent = sec;
        sectionSelect.appendChild(option);
    });
    courseIds.forEach(cid => {
        const option = document.createElement('option');
        option.value = cid;
        option.textContent = cid;
        courseIdSelect.appendChild(option);
    });

    // Add event listeners for active filter highlighting
    const selects = [schoolYearSelect, semesterSelect, programCodeSelect, yearLevelSelect, sectionSelect, courseIdSelect];
    selects.forEach(select => {
        select.addEventListener('change', () => {
            if (select.value) {
                select.parentElement.classList.add('active-filter');
            } else {
                select.parentElement.classList.remove('active-filter');
            }
        });
    });
}

function populateLoadsDropdowns(loads) {
    const schoolYearSelect = document.getElementById('loadsSchoolYearId');
    const semesterSelect = document.getElementById('loadsSemester');
    const programCodeSelect = document.getElementById('loadsProgramCode');
    const yearLevelSelect = document.getElementById('loadsYearLevel');
    const sectionSelect = document.getElementById('loadsSection');
    const courseIdSelect = document.getElementById('loadsCourseId');
    const teacherIdSelect = document.getElementById('loadsTeacherId');

    // Clear existing options except "All"
    [schoolYearSelect, semesterSelect, programCodeSelect, yearLevelSelect, sectionSelect, courseIdSelect, teacherIdSelect].forEach(select => {
        select.innerHTML = '<option value="">All</option>';
        select.parentElement.classList.remove('active-filter');
    });

    // Get unique values
    const schoolYears = [...new Set(loads.map(l => l.school_year_id))];
    const semesters = [...new Set(loads.map(l => l.semester))];
    const programCodes = [...new Set(loads.map(l => l.program_code).filter(p => p))];
    const yearLevels = [...new Set(loads.map(l => l.year_level))];
    const sections = [...new Set(loads.map(l => l.section))];
    const courseIds = [...new Set(loads.map(l => l.course_id))];
    const teacherIds = [...new Set(loads.map(l => l.teacher_id))];

    // Populate
    schoolYears.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        schoolYearSelect.appendChild(option);
    });
    semesters.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = s;
        semesterSelect.appendChild(option);
    });
    programCodes.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        programCodeSelect.appendChild(option);
    });
    yearLevels.forEach(yl => {
        const option = document.createElement('option');
        option.value = yl;
        option.textContent = yl;
        yearLevelSelect.appendChild(option);
    });
    sections.forEach(sec => {
        const option = document.createElement('option');
        option.value = sec;
        option.textContent = sec;
        sectionSelect.appendChild(option);
    });
    courseIds.forEach(cid => {
        const option = document.createElement('option');
        option.value = cid;
        option.textContent = cid;
        courseIdSelect.appendChild(option);
    });
    teacherIds.forEach(tid => {
        const option = document.createElement('option');
        option.value = tid;
        option.textContent = tid;
        teacherIdSelect.appendChild(option);
    });

    // Add event listeners for active filter highlighting
    const selects = [schoolYearSelect, semesterSelect, programCodeSelect, yearLevelSelect, sectionSelect, courseIdSelect, teacherIdSelect];
    selects.forEach(select => {
        select.addEventListener('change', () => {
            if (select.value) {
                select.parentElement.classList.add('active-filter');
            } else {
                select.parentElement.classList.remove('active-filter');
            }
        });
    });
}

document.querySelector('#loginForm form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const key = document.getElementById('apiKey').value;
    
    displayRequestUrl('POST', '/login', 'Authenticate with API key');
    
    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: key })
        });
        const data = await res.json();
        if (res.ok) {
            apiKey = key;
            setResponse('Logged in as ' + data.user.type + ' ' + data.user.name);
        } else {
            setResponse(data.error);
        }
    } catch (err) {
        setResponse('Error: ' + err.message);
    }
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const codeElement = document.querySelector('#response code');
    navigator.clipboard.writeText(codeElement.textContent).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
    });
});

document.getElementById('maximizeBtn').addEventListener('click', () => {
    const responseDiv = document.querySelector('.response');
    const btn = document.getElementById('maximizeBtn');
    if (responseDiv.classList.contains('maximized')) {
        responseDiv.classList.remove('maximized');
        btn.textContent = 'Max';
    } else {
        responseDiv.classList.add('maximized');
        btn.textContent = 'Min';
    }
});

document.querySelector('#loadsForm form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!apiKey) return alert('Login first');
    const filters = {
        school_year_id: document.getElementById('loadsSchoolYearId').value,
        semester: document.getElementById('loadsSemester').value,
        program_code: document.getElementById('loadsProgramCode').value,
        year_level: document.getElementById('loadsYearLevel').value,
        section: document.getElementById('loadsSection').value,
        course_id: document.getElementById('loadsCourseId').value,
        teacher_id: document.getElementById('loadsTeacherId').value
    };
    const params = new URLSearchParams();
    const highlights = {};
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            params.append(key, value);
            highlights[key] = value;
        }
    }
    
    const queryString = params.toString();
    const fullUrl = '/teaching-loads' + (queryString ? '?' + queryString : '');
    displayRequestUrl('GET', fullUrl, 'View teaching assignments with filters');
    
    try {
        const res = await fetch(fullUrl, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2), highlights);
    } catch (err) {
        setResponse('Error: ' + err.message);
    }
});

document.querySelector('#gradesForm form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!apiKey) return alert('Login first');
    const filters = {
        school_year_id: document.getElementById('schoolYearId').value,
        semester: document.getElementById('semester').value,
        program_code: document.getElementById('programCode').value,
        year_level: document.getElementById('yearLevel').value,
        section: document.getElementById('section').value,
        course_id: document.getElementById('courseId').value
    };
    const params = new URLSearchParams();
    const highlights = {};
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            params.append(key, value);
            highlights[key] = value;
        }
    }
    
    const queryString = params.toString();
    const fullUrl = '/grades' + (queryString ? '?' + queryString : '');
    displayRequestUrl('GET', fullUrl, 'Query student grades with filters');
    
    try {
        const res = await fetch(fullUrl, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2), highlights);
    } catch (err) {
        setResponse('Error: ' + err.message);
    }
});
