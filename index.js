const API_URL = 'https://webpagehire-backend-4.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    const developerGrid = document.getElementById('developerGrid');
    const registrationForm = document.getElementById('registrationForm');
    const developersGrid = document.getElementById('developersGrid');
    const viewDevelopersBtn = document.getElementById('viewDevelopersBtn');
    const registerDeveloperBtn = document.getElementById('registerDeveloperBtn');
    const developerForm = document.getElementById('developerForm');
    const mainContainer = document.querySelector('.container');

    // Toggle between views
    viewDevelopersBtn.addEventListener('click', function() {
        this.classList.add('active');
        registerDeveloperBtn.classList.remove('active');
        registrationForm.style.display = 'none';
        developersGrid.style.display = 'block';
        showBackButton(false);
    });

    registerDeveloperBtn.addEventListener('click', function() {
        this.classList.add('active');
        viewDevelopersBtn.classList.remove('active');
        registrationForm.style.display = 'block';
        developersGrid.style.display = 'none';
        showBackButton(false);
    });

    // Show/hide back button
    function showBackButton(show) {
        const existingBackBtn = document.getElementById('backButton');
        if (show && !existingBackBtn) {
            const backBtn = document.createElement('button');
            backBtn.id = 'backButton';
            backBtn.className = 'back-btn';
            backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Developers';
            backBtn.addEventListener('click', function() {
                developersGrid.style.display = 'block';
                registrationForm.style.display = 'none';
                this.remove();
            });
            mainContainer.prepend(backBtn);
        } else if (!show && existingBackBtn) {
            existingBackBtn.remove();
        }
    }

    // Form submission
    developerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const employmentType = document.querySelector('input[name="employmentType"]:checked').value;
            const experience = document.querySelector('input[name="experience"]:checked').value;
            
            const newDeveloper = {
                name: document.getElementById('name').value,
                position: document.getElementById('position').value,
                skills: document.getElementById('skills').value,
                description: document.getElementById('description').value,
                employmentType: employmentType,
                experience: experience,
                linkedin: document.getElementById('linkedin').value || null
            };

            // Add conditional fields
            if (employmentType === 'freelance') {
                newDeveloper.hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || null;
                newDeveloper.availability = parseInt(document.getElementById('availability').value) || null;
            } else if (experience === 'experienced') {
                newDeveloper.company = document.getElementById('company').value || null;
                newDeveloper.yearsOfExperience = parseInt(document.getElementById('yearsOfExperience').value) || null;
            }

            const response = await fetch(`${API_URL}/api/developers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDeveloper)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to register developer');
            }

            this.reset();
            viewDevelopersBtn.click();
            renderDevelopers();
            alert('Profile registered successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Toggle employment type and experience fields
    function updateFormFields() {
        const employmentType = document.querySelector('input[name="employmentType"]:checked')?.value;
        const experience = document.querySelector('input[name="experience"]:checked')?.value;
        
        document.getElementById('employmentFields').innerHTML = '';
        
        if (employmentType === 'freelance') {
            document.getElementById('employmentFields').innerHTML = `
                <div class="form-group">
                    <label for="hourlyRate">Hourly Rate ($)</label>
                    <input type="number" id="hourlyRate" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="availability">Weekly Availability (hours)</label>
                    <input type="number" id="availability" min="1" max="168" required>
                </div>
            `;
        } else if (experience === 'experienced') {
            document.getElementById('employmentFields').innerHTML = `
                <div class="form-group">
                    <label for="company">Company Name</label>
                    <input type="text" id="company" required>
                </div>
                <div class="form-group">
                    <label for="yearsOfExperience">Years of Experience</label>
                    <input type="number" id="yearsOfExperience" min="1" required>
                </div>
            `;
        }
    }

    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="employmentType"]').forEach(radio => {
        radio.addEventListener('change', updateFormFields);
    });
    
    document.querySelectorAll('input[name="experience"]').forEach(radio => {
        radio.addEventListener('change', updateFormFields);
    });

    // Initialize form fields
    updateFormFields();

    // Render developer cards
    async function renderDevelopers() {
        try {
            const response = await fetch(`${API_URL}/api/developers`);
            if (!response.ok) {
                throw new Error('Failed to fetch developers');
            }
            const developers = await response.json();
            
            developerGrid.innerHTML = '';
            
            developers.forEach(developer => {
                const card = document.createElement('div');
                card.className = 'developer-card';
                
                let employmentInfo = '';
                if (developer.employmentType === 'freelance') {
                    employmentInfo = `
                        <div class="employment-info">
                           
                            <span>$${developer.hourlyRate}/hr</span>
                            <span>${developer.availability} hrs/week</span>
                        </div>
                    `;
                } else {
                    const employmentLabel = developer.employmentType === 'fulltime' ? 'Full-time' : 'Part-time';
                    employmentInfo = `
                        <div class="employment-info">
                         
                            ${developer.company ? `<span>company name:${developer.company}</span>` : ''}
                            ${developer.yearsOfExperience ? `<span>${developer.yearsOfExperience} yrs exp</span>` : ''}
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    <div class="card-header"></div>
                    <div class="card-body">
                        <h3 class="developer-name">${developer.name}</h3>
                        <div class="developer-position">${developer.position}</div>
                        ${employmentInfo}
                        <div class="developer-description">${developer.description}</div>
                        <div class="developer-skills">
                            ${developer.skills.split(',').map(skill => `<span class="tag">${skill.trim()}</span>`).join('')}
                        </div>
                    
                        <button class="hire-btn" data-id="${developer.id}" data-name="${developer.name}" data-position="${developer.position}">
                            <i class="fas fa-handshake"></i> Hire Me
                        </button>
                    </div>
                `;
                
                developerGrid.appendChild(card);
            });

            // Add event listeners to all Hire Me buttons
            document.querySelectorAll('.hire-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const developerId = this.getAttribute('data-id');
                    const developerName = this.getAttribute('data-name');
                    const developerPosition = this.getAttribute('data-position');
                    
                    window.location.href = `contact.html?id=${developerId}&name=${encodeURIComponent(developerName)}&position=${encodeURIComponent(developerPosition)}`;
                });
            });
            
        } catch (error) {
            console.error('Error fetching developers:', error);
            developerGrid.innerHTML = `<div class="error">Error loading developers. Please try again later.</div>`;
        }
    }

    // Initial render
    renderDevelopers();
});