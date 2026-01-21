let apiKey = '';

function setResponse(text) {
    const codeElement = document.querySelector('#response code');
    codeElement.textContent = text;
    Prism.highlightElement(codeElement);
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
document.getElementById('loadsBtn').addEventListener('click', () => showForm('loadsForm'));
document.getElementById('gradesBtn').addEventListener('click', async () => {
    if (!apiKey) {
        alert('Login first');
        return;
    }
    // Fetch teaching loads and populate dropdowns
    try {
        const res = await fetch('/teaching-loads', {
            headers: { 'x-api-key': apiKey }
        });
        const loads = await res.json();
        if (res.ok) {
            populateDropdowns(loads);
            showForm('gradesForm');
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
}

document.querySelector('#loginForm form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const key = document.getElementById('apiKey').value;
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
    try {
        const res = await fetch('/teaching-loads', {
            headers: { 'x-api-key': apiKey }
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
        setResponse('Error: ' + err.message);
    }
});

document.querySelector('#gradesForm form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!apiKey) return alert('Login first');
    const params = new URLSearchParams({
        school_year_id: document.getElementById('schoolYearId').value,
        semester: document.getElementById('semester').value,
        program_code: document.getElementById('programCode').value,
        year_level: document.getElementById('yearLevel').value,
        section: document.getElementById('section').value,
        course_id: document.getElementById('courseId').value
    });
    // Remove empty params
    for (let [key, value] of params) {
        if (!value) params.delete(key);
    }
    try {
        const res = await fetch('/grades?' + params, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
        setResponse('Error: ' + err.message);
    }
});
