// Update API paths
const API_BASE_URL = window.location.origin;
let currentStep = 0;
let totalSteps = 0;
const fieldsPerStep = 3;

// Gestión de secciones de la página
function showSection(sectionId) {
    
    document.getElementById('intro-section').style.display = 'none';
    document.getElementById('classification-section').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'classification-section') {
        document.getElementById('result').style.display = 'none';
        document.getElementById('new-query-container').style.display = 'none';
        document.getElementById('loading-indicator').style.display = 'flex';
        document.getElementById('form-container').style.display = 'none';
        
        loadFormInputs();
    }
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

function showError() {
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('form-container').style.display = 'none';
}

function showForm() {
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('form-container').style.display = 'block';
}


function resetForm() {
    
    document.getElementById('result').style.display = 'none';
    document.getElementById('new-query-container').style.display = 'none';
    
    currentStep = 0;
    
    const formFields = document.getElementById('form-fields');
    if (formFields) {
        formFields.innerHTML = '';
    }
    
    const progressBar = document.querySelector('.progress-bar');
    const indicators = progressBar.querySelectorAll('.step-indicator');
    indicators.forEach(indicator => {
        if (indicator !== progressBar.firstElementChild) {
            progressBar.removeChild(indicator);
        }
    });
    
    document.getElementById('loading-indicator').style.display = 'flex';
    document.getElementById('form-container').style.display = 'none';
    
    loadFormInputs();
}

async function loadFormInputs() {
    try {
        console.log('Fetching form inputs from:', `${API_BASE_URL}/form-inputs`);
        const response = await fetch(`${API_BASE_URL}/form-inputs`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Form data received:', data);
        
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Empty data received from API');
        }
        
        createFormSteps(data);
        
        setupNavigation();
        
        showStep(currentStep);
        
        showForm();
        
    } catch (error) {
        console.error('Error loading form inputs:', error);
        showError();
    }
}

function createFormSteps(data) {
    const form = document.getElementById('mushroom-form');
    const formFields = document.createElement('div');
    formFields.id = 'form-fields';
    form.insertBefore(formFields, document.querySelector('.form-navigation'));
    
    const allKeys = Object.keys(data);
    
    totalSteps = Math.ceil(allKeys.length / fieldsPerStep);
    

    createStepIndicators(totalSteps);
    
    for (let i = 0; i < totalSteps; i++) {
        const step = document.createElement('div');
        step.className = 'form-step';
        step.id = `step-${i}`;
        
        const stepTitle = document.createElement('h2');
        stepTitle.className = 'step-title';
        stepTitle.textContent = `Step ${i + 1}: ${i === 0 ? 'Basic Characteristics' : i === totalSteps - 1 ? 'Final Details' : `More Features`}`;
        step.appendChild(stepTitle);

        const stepStartIndex = i * fieldsPerStep;
        const stepKeys = allKeys.slice(stepStartIndex, stepStartIndex + fieldsPerStep);
        
        
        stepKeys.forEach(key => {
            const values = data[key];
            
            
            const fieldName = key.replace(/-/g, '_');
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.setAttribute('for', fieldName);
            label.textContent = key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            
            const select = document.createElement('select');
            select.id = fieldName;
            select.name = fieldName;
            select.required = true;
            
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
            
            formGroup.appendChild(label);
            formGroup.appendChild(select);
            step.appendChild(formGroup);
        });
        
        formFields.appendChild(step);
    }
}

function createStepIndicators(steps) {
    const progressBar = document.querySelector('.progress-bar');
    while (progressBar.firstChild) {
        if (progressBar.firstChild.id === 'progress-fill') {
            const progressFill = progressBar.firstChild;
            const nextSibling = progressFill.nextSibling;
            if (nextSibling) {
                progressBar.removeChild(nextSibling);
            } else {
                break;
            }
        } else {
            progressBar.removeChild(progressBar.firstChild);
        }
    }

    for (let i = 0; i < steps; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        indicator.textContent = i + 1;
        indicator.dataset.step = i;

        if (i === 0) {
            indicator.classList.add('active');
        }
        
        progressBar.appendChild(indicator);
    }
    
    updateProgressBar();
}

function showStep(stepIndex) {

    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    document.getElementById(`step-${stepIndex}`).classList.add('active');
    
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index < stepIndex) {
            indicator.classList.add('completed');
        } else if (index === stepIndex) {
            indicator.classList.add('active');
        }
    });
    

    document.getElementById('prev-btn').disabled = stepIndex === 0;
    

    if (stepIndex === totalSteps - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'block';
        document.getElementById('submit-btn').style.display = 'none';
    }
    

    updateProgressBar();
}

function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const percentage = ((currentStep) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${percentage}%`;
}

function setupNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });
}

function setupDemoHistory() {
    // Esta función podría conectarse a una base de datos en el futuro
    // Por ahora, solo muestra datos de ejemplo o un mensaje de placeholder
}


function setupFormSubmission() {
    document.getElementById('mushroom-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        try {
            document.getElementById('submit-btn').disabled = true;
            document.getElementById('submit-btn').textContent = 'Procesando...';
            
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formObject)
            });
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const result = await response.json();
            
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.className = `result ${result.prediction} show`;
            
            const probability = (result.probability * 100).toFixed(2);
            resultDiv.innerHTML = `<h2>Result: ${result.prediction.toUpperCase()}</h2>
                                  <p>Confidence: ${probability}%</p>
                                  <p class="result-description">
                                    ${result.prediction === 'edible' ? 
                                      'Este hongo parece ser comestible según sus características. Sin embargo, siempre consulte a un experto antes de consumir hongos silvestres.' : 
                                      '¡ADVERTENCIA! Este hongo parece ser venenoso según sus características. No lo consuma bajo ninguna circunstancia.'}
                                  </p>`;
            
            document.getElementById('new-query-container').style.display = 'block';
            
            resultDiv.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form');
        } finally {
            document.getElementById('submit-btn').disabled = false;
            document.getElementById('submit-btn').textContent = 'Classify Mushroom';
        }
    });
}

function init() {
    document.getElementById('logo-link').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('intro-section');
    });
    
    document.getElementById('new-classification-btn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('classification-section');
    });
    
    document.getElementById('start-classification-btn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('classification-section');
    });
    
    document.getElementById('new-query-btn').addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });
    
    setupFormSubmission();
    setupDemoHistory();
}

window.addEventListener('load', init);