// Update API paths
const API_BASE_URL = window.location.origin;
let currentStep = 0;
let totalSteps = 0;
const fieldsPerStep = 3;

// Gestión de secciones de la página
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.getElementById('intro-section').style.display = 'none';
    document.getElementById('classification-section').style.display = 'none';
    
    // Mostrar la sección solicitada
    document.getElementById(sectionId).style.display = 'block';
    
    // Si es la sección de clasificación, iniciar el proceso
    if (sectionId === 'classification-section') {
        // Asegurarse de que el contenedor del resultado y nueva consulta estén ocultos
        document.getElementById('result').style.display = 'none';
        document.getElementById('new-query-container').style.display = 'none';
        
        // Mostrar el indicador de carga
        document.getElementById('loading-indicator').style.display = 'flex';
        document.getElementById('form-container').style.display = 'none';
        
        // Cargar el formulario
        loadFormInputs();
    }
    
    // Hacer scroll hacia la sección
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
    // Ocultar resultado y botón de nueva consulta
    document.getElementById('result').style.display = 'none';
    document.getElementById('new-query-container').style.display = 'none';
    
    // Restablecer el paso actual al primero
    currentStep = 0;
    
    // Limpiar el contenido actual del formulario
    const formFields = document.getElementById('form-fields');
    if (formFields) {
        formFields.innerHTML = '';
    }
    
    // Limpiar indicadores de pasos
    const progressBar = document.querySelector('.progress-bar');
    const indicators = progressBar.querySelectorAll('.step-indicator');
    indicators.forEach(indicator => {
        if (indicator !== progressBar.firstElementChild) {
            progressBar.removeChild(indicator);
        }
    });
    
    // Mostrar el indicador de carga
    document.getElementById('loading-indicator').style.display = 'flex';
    document.getElementById('form-container').style.display = 'none';
    
    // Cargar el formulario nuevamente
    loadFormInputs();
}

async function loadFormInputs() {
    try {
        console.log('Cargando datos del formulario desde:', `${API_BASE_URL}/form-inputs`);
        const response = await fetch(`${API_BASE_URL}/form-inputs`);
        
        if (!response.ok) {
            throw new Error(`La API respondió con estado: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Se recibieron datos vacíos de la API');
        }
        
        // Crear pasos del formulario
        createFormSteps(data);
        
        // Configurar navegación
        setupNavigation();
        
        // Mostrar primer paso
        showStep(currentStep);
        
        // Mostrar el formulario
        showForm();
        
    } catch (error) {
        console.error('Error al cargar datos del formulario:', error);
        showError();
    }
}

function createFormSteps(data) {
    const form = document.getElementById('mushroom-form');
    
    // Verificar si ya existe el contenedor de campos
    let formFields = document.getElementById('form-fields');
    if (!formFields) {
        formFields = document.createElement('div');
        formFields.id = 'form-fields';
        form.insertBefore(formFields, document.querySelector('.form-navigation'));
    } else {
        formFields.innerHTML = '';
    }
    
    // Obtener todas las claves del objeto de datos
    const allKeys = Object.keys(data);
    
    // Calcular total de pasos necesarios (3 campos por paso)
    totalSteps = Math.ceil(allKeys.length / fieldsPerStep);
    
    // Crear indicadores de paso
    createStepIndicators(totalSteps);
    
    // Agrupar campos en pasos
    for (let i = 0; i < totalSteps; i++) {
        // Crear contenedor para este paso
        const step = document.createElement('div');
        step.className = 'form-step';
        step.id = `step-${i}`;
        
        // Añadir título del paso
        const stepTitle = document.createElement('h2');
        stepTitle.className = 'step-title';
        stepTitle.textContent = `Paso ${i + 1}: ${i === 0 ? 'Características Básicas' : i === totalSteps - 1 ? 'Detalles Finales' : `Características Adicionales`}`;
        step.appendChild(stepTitle);
        
        // Obtener las claves para este paso (3 por paso)
        const stepStartIndex = i * fieldsPerStep;
        const stepKeys = allKeys.slice(stepStartIndex, stepStartIndex + fieldsPerStep);
        
        // Crear campos para cada clave en este paso
        stepKeys.forEach(key => {
            const values = data[key];
            
            // Convertir kebab-case a snake_case para compatibilidad con la API
            const fieldName = key.replace(/-/g, '_');
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.setAttribute('for', fieldName);
            label.textContent = traducirCampo(key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
            
            const select = document.createElement('select');
            select.id = fieldName;
            select.name = fieldName;
            select.required = true;
            select.className = 'campo-requerido';
            
            // Añadir opción predeterminada "Seleccionar"
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Seleccionar";
            defaultOption.selected = true;
            defaultOption.disabled = true;
            select.appendChild(defaultOption);
            
            // Añadir opciones
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                // Capitalizar primera letra si no es una sigla
                option.textContent = traducirValor(value.charAt(0).toUpperCase() + value.slice(1));
                select.appendChild(option);
            });
            
            // Evento para validar selección
            select.addEventListener('change', validateCurrentStep);
            
            formGroup.appendChild(label);
            formGroup.appendChild(select);
            step.appendChild(formGroup);
        });
        
        formFields.appendChild(step);
    }
}

// Función para traducir nombres de campos
function traducirCampo(campo) {
    const traducciones = {
        'Bruises': 'Moretones/Manchas',
        'Odor': 'Olor',
        'Gill Spacing': 'Espaciado de Láminas',
        'Gill Size': 'Tamaño de Láminas',
        'Gill Color': 'Color de Láminas',
        'Stalk Root': 'Raíz del Tallo',
        'Stalk Surface Above Ring': 'Superficie del Tallo Sobre el Anillo',
        'Stalk Surface Below Ring': 'Superficie del Tallo Bajo el Anillo',
        'Stalk Color Above Ring': 'Color del Tallo Sobre el Anillo',
        'Stalk Color Below Ring': 'Color del Tallo Bajo el Anillo',
        'Ring Type': 'Tipo de Anillo',
        'Spore Print Color': 'Color de Esporada',
        'Population': 'Población',
        'Habitat': 'Hábitat'
    };
    
    return traducciones[campo] || campo;
}

// Función para traducir valores
function traducirValor(valor) {
    const traducciones = {
        // Valores comunes
        'Yes': 'Sí',
        'No': 'No',
        
        // Olores
        'Almond': 'Almendra',
        'Anise': 'Anís',
        'Creosote': 'Creosota',
        'Fishy': 'Pescado',
        'Foul': 'Desagradable',
        'Musty': 'Mohoso',
        'None': 'Ninguno',
        'Pungent': 'Penetrante',
        'Spicy': 'Picante',
        
        // Espaciado
        'Close': 'Cercano',
        'Crowded': 'Apiñado',
        'Distant': 'Distante',
        
        // Tamaños
        'Broad': 'Ancho',
        'Narrow': 'Estrecho',
        
        // Colores
        'Black': 'Negro',
        'Brown': 'Marrón',
        'Buff': 'Beige',
        'Chocolate': 'Chocolate',
        'Gray': 'Gris',
        'Green': 'Verde',
        'Orange': 'Naranja',
        'Pink': 'Rosa',
        'Purple': 'Púrpura',
        'Red': 'Rojo',
        'White': 'Blanco',
        'Yellow': 'Amarillo',
        
        // Raíz
        'Bulbous': 'Bulbosa',
        'Club': 'En forma de mazo',
        'Cup': 'En forma de copa',
        'Equal': 'Igual',
        'Rhizomorphs': 'Rizomorfos',
        'Rooted': 'Enraizada',
        'Missing': 'Ausente',
        
        // Superficies
        'Fibrous': 'Fibrosa',
        'Scaly': 'Escamosa',
        'Silky': 'Sedosa',
        'Smooth': 'Lisa',
        
        // Más colores
        'Cinnamon': 'Canela',
        
        // Tipos de anillo
        'Evanescent': 'Evanescente',
        'Flaring': 'Acampanado',
        'Large': 'Grande',
        'Pendant': 'Colgante',
        
        // Población
        'Abundant': 'Abundante',
        'Clustered': 'Agrupada',
        'Numerous': 'Numerosa',
        'Scattered': 'Dispersa',
        'Several': 'Varios',
        'Solitary': 'Solitaria',
        
        // Hábitat
        'Grasses': 'Pastizales',
        'Leaves': 'Hojas',
        'Meadows': 'Praderas',
        'Paths': 'Senderos',
        'Urban': 'Urbano',
        'Waste': 'Desechos',
        'Woods': 'Bosques'
    };
    
    return traducciones[valor] || valor;
}

// Validar selecciones en el paso actual
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const selects = currentStepElement.querySelectorAll('select');
    let isValid = true;
    
    selects.forEach(select => {
        if (!select.value) {
            isValid = false;
        }
    });
    
    // Habilitar/deshabilitar botón siguiente según validación
    document.getElementById('next-btn').disabled = !isValid;
    
    // Si es el último paso, también validar el botón de enviar
    if (currentStep === totalSteps - 1) {
        document.getElementById('submit-btn').disabled = !isValid;
    }
    
    return isValid;
}

function createStepIndicators(steps) {
    const progressBar = document.querySelector('.progress-bar');
    
    // Limpiar indicadores existentes excepto la barra de progreso
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
        
        // Marcar primer indicador como activo
        if (i === 0) {
            indicator.classList.add('active');
        }
        
        progressBar.appendChild(indicator);
    }
    
    // Establecer ancho inicial de barra de progreso
    updateProgressBar();
}

function showStep(stepIndex) {
    // Ocultar todos los pasos
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Mostrar paso actual
    document.getElementById(`step-${stepIndex}`).classList.add('active');
    
    // Actualizar indicadores
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index < stepIndex) {
            indicator.classList.add('completed');
        } else if (index === stepIndex) {
            indicator.classList.add('active');
        }
    });
    
    // Actualizar botones
    document.getElementById('prev-btn').disabled = stepIndex === 0;
    
    // Mostrar/ocultar botones de siguiente y enviar
    if (stepIndex === totalSteps - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'block';
        document.getElementById('submit-btn').style.display = 'none';
    }
    
    // Validar el paso actual
    validateCurrentStep();
    
    // Actualizar barra de progreso
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
        if (validateCurrentStep() && currentStep < totalSteps - 1) {
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
        
        if (!validateCurrentStep()) {
            alert('Por favor complete todos los campos antes de enviar.');
            return;
        }
        
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
                throw new Error(`La API respondió con estado: ${response.status}`);
            }
            
            const result = await response.json();
            
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.className = `result ${result.prediction} show`;
            
            const probability = (result.probability * 100).toFixed(2);
            
            // Traducir resultado
            const resultText = result.prediction === 'edible' ? 'COMESTIBLE' : 'VENENOSO';
            
            resultDiv.innerHTML = `<h2>Resultado: ${resultText}</h2>
                                  <p>Confianza: ${probability}%</p>
                                  <p class="result-description">
                                    ${result.prediction === 'edible' ? 
                                      'Este hongo parece ser comestible según sus características. Sin embargo, siempre consulte a un experto antes de consumir hongos silvestres.' : 
                                      '¡ADVERTENCIA! Este hongo parece ser venenoso según sus características. No lo consuma bajo ninguna circunstancia.'}
                                  </p>`;
            
            document.getElementById('new-query-container').style.display = 'block';
            
            resultDiv.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Ha ocurrido un error al enviar el formulario');
        } finally {
            document.getElementById('submit-btn').disabled = false;
            document.getElementById('submit-btn').textContent = 'Clasificar Hongo';
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