let apiKey = '';

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
document.getElementById('gradesBtn').addEventListener('click', () => showForm('gradesForm'));

// Show login by default
showForm('loginForm');

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
            document.getElementById('response').textContent = 'Logged in as ' + data.teacher.name;
        } else {
            document.getElementById('response').textContent = data.error;
        }
    } catch (err) {
        document.getElementById('response').textContent = 'Error: ' + err.message;
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
        document.getElementById('response').textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById('response').textContent = 'Error: ' + err.message;
    }
});

document.querySelector('#gradesForm form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!apiKey) return alert('Login first');
    const params = new URLSearchParams({
        school_year: document.getElementById('schoolYear').value,
        semester: document.getElementById('semester').value,
        program_code: document.getElementById('programCode').value,
        section: document.getElementById('section').value
    });
    try {
        const res = await fetch('/grades?' + params, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await res.json();
        document.getElementById('response').textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById('response').textContent = 'Error: ' + err.message;
    }
});
