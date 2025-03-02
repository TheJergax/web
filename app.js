// Global variables
let currentUser = null;
let users = [
    {
        username: 'administrador',
        password: 'administrador1234',
        isAdmin: true
    }
];
let residentialUnits = [];
let activeVisitors = [];
let visitorsHistory = [];
let activePackages = [];
let packagesHistory = [];
let residents = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadData();
    
    // Event listeners for login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('adminBtn').addEventListener('click', showAdminLogin);
    
    // Admin page event listeners
    document.getElementById('adminLogoutBtn').addEventListener('click', logout);
    document.getElementById('userForm').addEventListener('submit', saveUser);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelUserEdit);
    
    // Main app event listeners
    document.getElementById('mainLogoutBtn').addEventListener('click', logout);
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', changeSection);
    });
    
    // Visitantes event listeners
    document.getElementById('medioTransporte').addEventListener('change', togglePlacaField);
    document.getElementById('visitanteForm').addEventListener('submit', registerVisitor);
    document.getElementById('exportPdfVisitantes').addEventListener('click', () => exportToPDF('visitantes'));
    document.getElementById('exportExcelVisitantes').addEventListener('click', () => exportToExcel('visitantes'));
    document.getElementById('searchVisitantesHistorial').addEventListener('input', filterVisitorsHistory);
    
    // Paquetes event listeners
    document.getElementById('paqueteForm').addEventListener('submit', registerPackage);
    document.getElementById('exportPdfPaquetes').addEventListener('click', () => exportToPDF('paquetes'));
    document.getElementById('exportExcelPaquetes').addEventListener('click', () => exportToExcel('paquetes'));
    document.getElementById('searchPaquete').addEventListener('input', filterPackages);
    document.getElementById('searchPaquetesHistorial').addEventListener('input', filterPackagesHistory);
    
    // Residentes event listeners
    document.getElementById('residenteForm').addEventListener('submit', saveResident);
    document.getElementById('cancelEditResidenteBtn').addEventListener('click', cancelResidentEdit);
    document.getElementById('searchResidente').addEventListener('input', filterResidents);
    
    // Add buttons for dynamic fields
    document.getElementById('addVehiclePlateBtn').addEventListener('click', () => addDynamicField('vehiclePlatesList'));
    document.getElementById('addParkingSpotBtn').addEventListener('click', () => addDynamicField('parkingSpotsList'));
    document.getElementById('addFamilyMemberBtn').addEventListener('click', () => addDynamicField('familyMembersList'));
    document.getElementById('addAuthorizedVisitorBtn').addEventListener('click', () => addDynamicField('authorizedVisitorsList'));
    
    // Initialize dynamic fields with one empty field each
    addDynamicField('vehiclePlatesList', '');
    addDynamicField('parkingSpotsList', '');
    addDynamicField('familyMembersList', '');
    addDynamicField('authorizedVisitorsList', '');
});

// Data handling functions
function loadData() {
    const storedUsers = localStorage.getItem('users');
    const storedUnits = localStorage.getItem('residentialUnits');
    const storedActiveVisitors = localStorage.getItem('activeVisitors');
    const storedVisitorsHistory = localStorage.getItem('visitorsHistory');
    const storedActivePackages = localStorage.getItem('activePackages');
    const storedPackagesHistory = localStorage.getItem('packagesHistory');
    const storedResidents = localStorage.getItem('residents');
    
    if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        // Ensure admin user always exists
        const adminExists = parsedUsers.some(user => user.username === 'administrador');
        users = adminExists ? parsedUsers : [...parsedUsers, ...users];
    }
    
    residentialUnits = storedUnits ? JSON.parse(storedUnits) : [];
    activeVisitors = storedActiveVisitors ? JSON.parse(storedActiveVisitors) : [];
    visitorsHistory = storedVisitorsHistory ? JSON.parse(storedVisitorsHistory) : [];
    activePackages = storedActivePackages ? JSON.parse(storedActivePackages) : [];
    packagesHistory = storedPackagesHistory ? JSON.parse(storedPackagesHistory) : [];
    residents = storedResidents ? JSON.parse(storedResidents) : [];
    
    renderUsersList();
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('residentialUnits', JSON.stringify(residentialUnits));
    localStorage.setItem('activeVisitors', JSON.stringify(activeVisitors));
    localStorage.setItem('visitorsHistory', JSON.stringify(visitorsHistory));
    localStorage.setItem('activePackages', JSON.stringify(activePackages));
    localStorage.setItem('packagesHistory', JSON.stringify(packagesHistory));
    localStorage.setItem('residents', JSON.stringify(residents));
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check if admin
    if (username === 'administrador' && password === 'administrador1234') {
        showAdminPage();
        return;
    }
    
    // Check for regular users
    const user = users.find(u => u.username === username && u.password === password && !u.isAdmin);
    
    if (user) {
        currentUser = user;
        const unit = residentialUnits.find(unit => unit.username === username);
        
        if (unit) {
            // Set unit name and logo
            document.getElementById('navbarSiteName').textContent = unit.name;
            
            if (unit.logo) {
                // Check if elements exist before setting properties
                const customLogo = document.getElementById('customLogo');
                const defaultLogo = document.getElementById('defaultLogo');
                
                if (customLogo) {
                    customLogo.src = unit.logo;
                    customLogo.style.display = 'block';
                }
                
                if (defaultLogo) {
                    defaultLogo.style.display = 'none';
                }
            }
            
            showMainApp();
            renderActiveVisitorsList();
            renderVisitorsHistory();
            renderPendingPackagesList();
            renderPackagesHistory();
            renderResidentsList();
        } else {
            alert('Error en configuración de unidad residencial.');
        }
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
}

function showAdminLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'administrador' && password === 'administrador1234') {
        showAdminPage();
    } else {
        alert('Credenciales de administrador incorrectas.');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    
    // Clear login form
    document.getElementById('loginForm').reset();
}

function showAdminPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPage').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    renderUsersList();
}

function showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Show visitantes section by default
    document.querySelectorAll('.app-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('visitantesSection').style.display = 'block';
    
    // Set active nav link
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('[data-section="visitantes"]').classList.add('active');
}

// Admin user management
function saveUser(e) {
    e.preventDefault();
    
    const editUserId = document.getElementById('editUserId').value;
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    const name = document.getElementById('residentialName').value;
    
    // Logo handling
    const logoUpload = document.getElementById('logoUpload');
    let logoData = null;
    
    if (logoUpload.files.length > 0) {
        const file = logoUpload.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            logoData = event.target.result;
            
            // Save residential unit with logo
            saveResidentialUnit(editUserId, username, password, name, logoData);
        };
        
        reader.readAsDataURL(file);
    } else {
        // Save without changing logo
        saveResidentialUnit(editUserId, username, password, name, null);
    }
}

function saveResidentialUnit(editUserId, username, password, name, logoData) {
    if (editUserId) {
        // Update existing user
        const index = users.findIndex(u => u.id === editUserId);
        
        if (index !== -1) {
            users[index].username = username;
            users[index].password = password;
            
            // Update unit info
            const unitIndex = residentialUnits.findIndex(unit => unit.username === users[index].username);
            
            if (unitIndex !== -1) {
                residentialUnits[unitIndex].name = name;
                if (logoData) {
                    residentialUnits[unitIndex].logo = logoData;
                }
            }
        }
    } else {
        // Check if username already exists
        if (users.some(u => u.username === username)) {
            alert('Este nombre de usuario ya existe.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password,
            isAdmin: false
        };
        
        users.push(newUser);
        
        // Create residential unit
        const newUnit = {
            username: username,
            name: name,
            logo: logoData
        };
        
        residentialUnits.push(newUnit);
    }
    
    saveData();
    renderUsersList();
    resetUserForm();
}

function renderUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    const regularUsers = users.filter(user => !user.isAdmin);
    
    regularUsers.forEach(user => {
        const unit = residentialUnits.find(unit => unit.username === user.username);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${unit ? unit.name : 'Sin nombre'}</td>
            <td class="action-icons">
                <i class="bi bi-pencil-square" data-id="${user.id}" title="Editar"></i>
                <i class="bi bi-trash" data-id="${user.id}" title="Eliminar"></i>
            </td>
        `;
        
        usersList.appendChild(row);
    });
    
    // Add event listeners to action icons
    document.querySelectorAll('#usersList .bi-pencil-square').forEach(icon => {
        icon.addEventListener('click', editUser);
    });
    
    document.querySelectorAll('#usersList .bi-trash').forEach(icon => {
        icon.addEventListener('click', deleteUser);
    });
}

function editUser(e) {
    const userId = e.target.getAttribute('data-id');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const unit = residentialUnits.find(unit => unit.username === user.username);
        
        document.getElementById('editUserId').value = userId;
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userPassword').value = user.password;
        
        if (unit) {
            document.getElementById('residentialName').value = unit.name;
        } else {
            document.getElementById('residentialName').value = '';
        }
        
        document.getElementById('cancelEditBtn').style.display = 'block';
    }
}

function deleteUser(e) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
        const userId = e.target.getAttribute('data-id');
        const user = users.find(u => u.id === userId);
        
        if (user) {
            // Remove user
            users = users.filter(u => u.id !== userId);
            
            // Remove residential unit
            residentialUnits = residentialUnits.filter(unit => unit.username !== user.username);
            
            saveData();
            renderUsersList();
        }
    }
}

function cancelUserEdit() {
    resetUserForm();
}

function resetUserForm() {
    document.getElementById('userForm').reset();
    document.getElementById('editUserId').value = '';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// Main app functionality
function changeSection(e) {
    e.preventDefault();
    
    // Update active nav link
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const sectionId = e.target.getAttribute('data-section') + 'Section';
    document.getElementById(sectionId).style.display = 'block';
}

// Visitor management
function togglePlacaField() {
    const medioTransporte = document.getElementById('medioTransporte').value;
    const placaContainer = document.getElementById('placaContainer');
    const placaField = document.getElementById('placaVehiculo');
    
    if (medioTransporte === 'Carro' || medioTransporte === 'Moto') {
        placaContainer.style.display = 'block';
        placaField.setAttribute('required', 'required');
    } else {
        placaContainer.style.display = 'none';
        placaField.removeAttribute('required');
        placaField.value = '';
    }
}

function registerVisitor(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreVisitante').value;
    const documento = document.getElementById('documentoVisitante').value;
    const apartamento = document.getElementById('apartamentoVisita').value;
    const autoriza = document.getElementById('autorizaVisita').value;
    const medioTransporte = document.getElementById('medioTransporte').value;
    const placa = document.getElementById('placaVehiculo').value;
    const observaciones = document.getElementById('observacionesVisita').value;
    
    const visitor = {
        id: Date.now().toString(),
        nombre,
        documento,
        apartamento,
        autoriza,
        medioTransporte,
        placa,
        observaciones,
        horaIngreso: new Date().toISOString(),
        horaSalida: null,
        unit: currentUser ? currentUser.username : 'admin'
    };
    
    activeVisitors.push(visitor);
    saveData();
    renderActiveVisitorsList();
    
    // Reset form
    document.getElementById('visitanteForm').reset();
    document.getElementById('placaContainer').style.display = 'none';
}

function renderActiveVisitorsList() {
    const activeVisitorsList = document.getElementById('activeVisitorsList');
    activeVisitorsList.innerHTML = '';
    
    // Filter visitors for current unit
    const unitVisitors = activeVisitors.filter(visitor => 
        visitor.unit === (currentUser ? currentUser.username : 'admin')
    );
    
    if (unitVisitors.length === 0) {
        activeVisitorsList.innerHTML = '<tr><td colspan="5" class="text-center">No hay visitantes activos</td></tr>';
        return;
    }
    
    unitVisitors.forEach(visitor => {
        const row = document.createElement('tr');
        
        const ingresoDate = new Date(visitor.horaIngreso);
        const formattedTime = ingresoDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>${visitor.nombre}</td>
            <td>${visitor.apartamento}</td>
            <td>${formattedTime}</td>
            <td>${visitor.medioTransporte}${visitor.placa ? ' - ' + visitor.placa : ''}</td>
            <td class="action-icons">
                <i class="bi bi-box-arrow-right" data-id="${visitor.id}" title="Registrar Salida"></i>
            </td>
        `;
        
        activeVisitorsList.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('#activeVisitorsList .bi-box-arrow-right').forEach(icon => {
        icon.addEventListener('click', registerVisitorExit);
    });
}

function registerVisitorExit(e) {
    const visitorId = e.target.getAttribute('data-id');
    const visitorIndex = activeVisitors.findIndex(v => v.id === visitorId);
    
    if (visitorIndex !== -1) {
        const visitor = activeVisitors[visitorIndex];
        visitor.horaSalida = new Date().toISOString();
        
        // Move to history
        visitorsHistory.push(visitor);
        
        // Remove from active
        activeVisitors.splice(visitorIndex, 1);
        
        saveData();
        renderActiveVisitorsList();
        renderVisitorsHistory();
    }
}

function renderVisitorsHistory() {
    const historyVisitorsList = document.getElementById('historyVisitorsList');
    historyVisitorsList.innerHTML = '';
    
    // Filter history for current unit
    const unitHistory = visitorsHistory.filter(visitor => 
        visitor.unit === (currentUser ? currentUser.username : 'admin')
    );
    
    if (unitHistory.length === 0) {
        historyVisitorsList.innerHTML = '<tr><td colspan="7" class="text-center">No hay historial de visitantes</td></tr>';
        return;
    }
    
    // Sort by most recent first
    unitHistory.sort((a, b) => new Date(b.horaSalida) - new Date(a.horaSalida));
    
    unitHistory.forEach(visitor => {
        const row = document.createElement('tr');
        
        const ingresoDate = new Date(visitor.horaIngreso);
        const salidaDate = new Date(visitor.horaSalida);
        
        const formattedIngreso = ingresoDate.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const formattedSalida = salidaDate.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>${visitor.nombre}</td>
            <td>${visitor.documento || '-'}</td>
            <td>${visitor.apartamento}</td>
            <td>${formattedIngreso}</td>
            <td>${formattedSalida}</td>
            <td>${visitor.medioTransporte}</td>
            <td>${visitor.placa || '-'}</td>
        `;
        
        historyVisitorsList.appendChild(row);
    });
}

function filterVisitorsHistory() {
    const searchTerm = document.getElementById('searchVisitantesHistorial').value.toLowerCase();
    const rows = document.querySelectorAll('#historyVisitorsList tr');
    
    rows.forEach(row => {
        // Skip header row or empty rows
        if (!row.cells || row.cells.length === 0) return;
        
        // Check if search term is found in any cell
        const rowText = row.textContent.toLowerCase();
        
        // Show row if criteria matches
        row.style.display = rowText.includes(searchTerm) ? '' : 'none';
    });
}

// Package management
function registerPackage(e) {
    e.preventDefault();
    
    const destinatario = document.getElementById('destinatarioPaquete').value;
    const apartamento = document.getElementById('apartamentoPaquete').value;
    const remitente = document.getElementById('remitentePaquete').value;
    const observaciones = document.getElementById('observacionesPaquete').value;
    
    const pkg = {
        id: Date.now().toString(),
        destinatario,
        apartamento,
        remitente,
        observaciones,
        fechaRecibido: new Date().toISOString(),
        fechaEntregado: null,
        unit: currentUser ? currentUser.username : 'admin'
    };
    
    activePackages.push(pkg);
    saveData();
    renderPendingPackagesList();
    
    // Reset form
    document.getElementById('paqueteForm').reset();
}

function renderPendingPackagesList() {
    const pendingPackagesList = document.getElementById('pendingPackagesList');
    pendingPackagesList.innerHTML = '';
    
    // Filter packages for current unit
    const unitPackages = activePackages.filter(pkg => 
        pkg.unit === (currentUser ? currentUser.username : 'admin')
    );
    
    if (unitPackages.length === 0) {
        pendingPackagesList.innerHTML = '<tr><td colspan="5" class="text-center">No hay paquetes pendientes</td></tr>';
        return;
    }
    
    unitPackages.forEach(pkg => {
        const row = document.createElement('tr');
        
        const recibidoDate = new Date(pkg.fechaRecibido);
        const formattedDate = recibidoDate.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>${pkg.destinatario}</td>
            <td>${pkg.apartamento}</td>
            <td>${pkg.remitente}</td>
            <td>${formattedDate}</td>
            <td class="action-icons">
                <i class="bi bi-check-circle" data-id="${pkg.id}" title="Marcar como Entregado"></i>
            </td>
        `;
        
        pendingPackagesList.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('#pendingPackagesList .bi-check-circle').forEach(icon => {
        icon.addEventListener('click', markPackageDelivered);
    });
}

function markPackageDelivered(e) {
    const packageId = e.target.getAttribute('data-id');
    const packageIndex = activePackages.findIndex(p => p.id === packageId);
    
    if (packageIndex !== -1) {
        const pkg = activePackages[packageIndex];
        pkg.fechaEntregado = new Date().toISOString();
        
        // Move to history
        packagesHistory.push(pkg);
        
        // Remove from active
        activePackages.splice(packageIndex, 1);
        
        saveData();
        renderPendingPackagesList();
        renderPackagesHistory();
    }
}

function renderPackagesHistory() {
    const historyPackagesList = document.getElementById('historyPackagesList');
    historyPackagesList.innerHTML = '';
    
    // Filter history for current unit
    const unitHistory = packagesHistory.filter(pkg => 
        pkg.unit === (currentUser ? currentUser.username : 'admin')
    );
    
    if (unitHistory.length === 0) {
        historyPackagesList.innerHTML = '<tr><td colspan="5" class="text-center">No hay historial de paquetes</td></tr>';
        return;
    }
    
    // Sort by most recent first
    unitHistory.sort((a, b) => new Date(b.fechaEntregado) - new Date(a.fechaEntregado));
    
    unitHistory.forEach(pkg => {
        const row = document.createElement('tr');
        
        const recibidoDate = new Date(pkg.fechaRecibido);
        const entregadoDate = new Date(pkg.fechaEntregado);
        
        const formattedRecibido = recibidoDate.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const formattedEntregado = entregadoDate.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>${pkg.destinatario}</td>
            <td>${pkg.apartamento}</td>
            <td>${pkg.remitente}</td>
            <td>${formattedRecibido}</td>
            <td>${formattedEntregado}</td>
        `;
        
        historyPackagesList.appendChild(row);
    });
}

function filterPackages() {
    const searchTerm = document.getElementById('searchPaquete').value.toLowerCase();
    const rows = document.querySelectorAll('#pendingPackagesList tr');
    
    rows.forEach(row => {
        const rowId = row.querySelector('.bi-check-circle')?.getAttribute('data-id');
        if (!rowId) return;
        
        const pkg = activePackages.find(p => p.id === rowId);
        if (!pkg) return;
        
        // Check if search term matches any of the package details
        const rowText = row.textContent.toLowerCase();
        
        // Show row if criteria matches
        row.style.display = (
            rowText.includes(searchTerm) || 
            pkg.destinatario.toLowerCase().includes(searchTerm) || 
            pkg.apartamento.toLowerCase().includes(searchTerm) || 
            pkg.remitente.toLowerCase().includes(searchTerm) ||
            pkg.observaciones?.toLowerCase().includes(searchTerm)
        ) ? '' : 'none';
    });
}

function filterPackagesHistory() {
    const searchTerm = document.getElementById('searchPaquetesHistorial').value.toLowerCase();
    const rows = document.querySelectorAll('#historyPackagesList tr');
    
    rows.forEach(row => {
        // Skip header row or empty rows
        if (!row.cells || row.cells.length === 0) return;
        
        // Check if search term is found in any cell
        const rowText = row.textContent.toLowerCase();
        
        // Show row if criteria matches
        row.style.display = rowText.includes(searchTerm) ? '' : 'none';
    });
}

// Resident management
function saveResident(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editResidenteId').value;
    const nombre = document.getElementById('nombreResidente').value;
    const documento = document.getElementById('documentoResidente').value;
    const tipo = document.getElementById('tipoResidente').value;
    const torre = document.getElementById('torre').value;
    const apartamento = document.getElementById('apartamento').value;
    
    // Get values from the dynamic fields
    const placaVehiculos = getMultipleFieldValues('vehiclePlatesList');
    const parqueaderos = getMultipleFieldValues('parkingSpotsList');
    const cuartoUtil = document.getElementById('cuartoUtil').value;
    const familiares = getMultipleFieldValues('familyMembersList');
    const visitantesAutorizados = getMultipleFieldValues('authorizedVisitorsList');
    
    if (editId) {
        // Update existing resident
        const index = residents.findIndex(r => r.id === editId);
        
        if (index !== -1) {
            residents[index] = {
                ...residents[index],
                nombre,
                documento,
                tipo,
                torre,
                apartamento,
                placaVehiculos,
                parqueaderos,
                cuartoUtil,
                familiares,
                visitantesAutorizados
            };
        }
    } else {
        // Create new resident
        const newResident = {
            id: Date.now().toString(),
            nombre,
            documento,
            tipo,
            torre,
            apartamento,
            placaVehiculos,
            parqueaderos,
            cuartoUtil,
            familiares,
            visitantesAutorizados,
            unit: currentUser ? currentUser.username : 'admin'
        };
        
        residents.push(newResident);
    }
    
    saveData();
    renderResidentsList();
    resetResidentForm();
}

function renderResidentsList() {
    const residentesList = document.getElementById('residentesList');
    residentesList.innerHTML = '';
    
    // Filter residents for current unit
    const unitResidents = residents.filter(resident => 
        resident.unit === (currentUser ? currentUser.username : 'admin')
    );
    
    if (unitResidents.length === 0) {
        residentesList.innerHTML = '<tr><td colspan="5" class="text-center">No hay residentes registrados</td></tr>';
        return;
    }
    
    // Sort by apartment and tower
    unitResidents.sort((a, b) => {
        if (a.torre === b.torre) {
            return a.apartamento.localeCompare(b.apartamento);
        }
        return a.torre.localeCompare(b.torre);
    });
    
    unitResidents.forEach(resident => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${resident.nombre}</td>
            <td>${resident.tipo}</td>
            <td>${resident.torre}</td>
            <td>${resident.apartamento}</td>
            <td class="action-icons">
                <i class="bi bi-eye" data-id="${resident.id}" title="Ver Detalles"></i>
                <i class="bi bi-pencil-square" data-id="${resident.id}" title="Editar"></i>
                <i class="bi bi-trash" data-id="${resident.id}" title="Eliminar"></i>
            </td>
        `;
        
        residentesList.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('#residentesList .bi-eye').forEach(icon => {
        icon.addEventListener('click', showResidentDetails);
    });
    
    document.querySelectorAll('#residentesList .bi-pencil-square').forEach(icon => {
        icon.addEventListener('click', editResident);
    });
    
    document.querySelectorAll('#residentesList .bi-trash').forEach(icon => {
        icon.addEventListener('click', deleteResident);
    });
}

function showResidentDetails(e) {
    const residentId = e.target.getAttribute('data-id');
    const resident = residents.find(r => r.id === residentId);
    
    if (resident) {
        const detailContent = document.getElementById('residenteDetailContent');
        
        // Format vehicle plates
        const platesHtml = resident.placaVehiculos && resident.placaVehiculos.length > 0 
            ? resident.placaVehiculos.map(plate => `<div>${plate}</div>`).join('') 
            : 'No registrado';
            
        // Format parking spots
        const spotsHtml = resident.parqueaderos && resident.parqueaderos.length > 0 
            ? resident.parqueaderos.map(spot => `<div>${spot}</div>`).join('') 
            : 'No registrado';
            
        // Format family members
        const familyHtml = resident.familiares && resident.familiares.length > 0 
            ? resident.familiares.map(member => `<div>${member}</div>`).join('') 
            : 'No registrados';
            
        // Format authorized visitors
        const visitorsHtml = resident.visitantesAutorizados && resident.visitantesAutorizados.length > 0 
            ? resident.visitantesAutorizados.map(visitor => `<div>${visitor}</div>`).join('') 
            : 'No registrados';
        
        detailContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>Información Personal</h5>
                    <p><strong>Nombre:</strong> ${resident.nombre}</p>
                    <p><strong>Documento:</strong> ${resident.documento || 'No registrado'}</p>
                    <p><strong>Tipo:</strong> ${resident.tipo}</p>
                    <p><strong>Torre/Bloque:</strong> ${resident.torre}</p>
                    <p><strong>Apartamento:</strong> ${resident.apartamento}</p>
                </div>
                <div class="col-md-6">
                    <h5>Vehículos y Parqueaderos</h5>
                    <p><strong>Placas:</strong></p>
                    <div class="ms-3">${platesHtml}</div>
                    <p><strong>Parqueaderos:</strong></p>
                    <div class="ms-3">${spotsHtml}</div>
                    <p><strong>Cuarto Útil:</strong> ${resident.cuartoUtil || 'No registrado'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <h5>Familiares</h5>
                    <div class="ms-3">${familyHtml}</div>
                </div>
                <div class="col-md-6">
                    <h5>Visitantes Autorizados</h5>
                    <div class="ms-3">${visitorsHtml}</div>
                </div>
            </div>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('residenteDetailModal'));
        modal.show();
    }
}

function editResident(e) {
    const residentId = e.target.getAttribute('data-id');
    const resident = residents.find(r => r.id === residentId);
    
    if (resident) {
        document.getElementById('editResidenteId').value = residentId;
        document.getElementById('nombreResidente').value = resident.nombre;
        document.getElementById('documentoResidente').value = resident.documento || '';
        document.getElementById('tipoResidente').value = resident.tipo;
        document.getElementById('torre').value = resident.torre;
        document.getElementById('apartamento').value = resident.apartamento;
        document.getElementById('cuartoUtil').value = resident.cuartoUtil || '';
        
        // Clear and populate dynamic fields
        clearDynamicFields('vehiclePlatesList');
        clearDynamicFields('parkingSpotsList');
        clearDynamicFields('familyMembersList');
        clearDynamicFields('authorizedVisitorsList');
        
        // Populate vehicle plates
        if (resident.placaVehiculos && resident.placaVehiculos.length > 0) {
            resident.placaVehiculos.forEach(plate => addDynamicField('vehiclePlatesList', plate));
        } else {
            addDynamicField('vehiclePlatesList', '');
        }
        
        // Populate parking spots
        if (resident.parqueaderos && resident.parqueaderos.length > 0) {
            resident.parqueaderos.forEach(spot => addDynamicField('parkingSpotsList', spot));
        } else {
            addDynamicField('parkingSpotsList', '');
        }
        
        // Populate family members
        if (resident.familiares && resident.familiares.length > 0) {
            resident.familiares.forEach(member => addDynamicField('familyMembersList', member));
        } else {
            addDynamicField('familyMembersList', '');
        }
        
        // Populate authorized visitors
        if (resident.visitantesAutorizados && resident.visitantesAutorizados.length > 0) {
            resident.visitantesAutorizados.forEach(visitor => addDynamicField('authorizedVisitorsList', visitor));
        } else {
            addDynamicField('authorizedVisitorsList', '');
        }
        
        document.getElementById('residenteFormTitle').textContent = 'Editar Residente';
        document.getElementById('cancelEditResidenteBtn').style.display = 'block';
        
        // Change to the registration tab
        document.querySelector('a[href="#registroResidentes"]').click();
        
        // Scroll to form
        document.getElementById('residenteForm').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteResident(e) {
    if (confirm('¿Está seguro de eliminar este residente?')) {
        const residentId = e.target.getAttribute('data-id');
        residents = residents.filter(r => r.id !== residentId);
        
        saveData();
        renderResidentsList();
    }
}

function cancelResidentEdit() {
    resetResidentForm();
}

function resetResidentForm() {
    document.getElementById('residenteForm').reset();
    document.getElementById('editResidenteId').value = '';
    document.getElementById('residenteFormTitle').textContent = 'Registrar Residente';
    document.getElementById('cancelEditResidenteBtn').style.display = 'none';
    
    // Reset dynamic fields
    clearDynamicFields('vehiclePlatesList');
    clearDynamicFields('parkingSpotsList');
    clearDynamicFields('familyMembersList');
    clearDynamicFields('authorizedVisitorsList');
    
    // Add one empty field for each section
    addDynamicField('vehiclePlatesList', '');
    addDynamicField('parkingSpotsList', '');
    addDynamicField('familyMembersList', '');
    addDynamicField('authorizedVisitorsList', '');
}

function filterResidents() {
    const searchTerm = document.getElementById('searchResidente').value.toLowerCase();
    const rows = document.querySelectorAll('#residentesList tr');
    
    rows.forEach(row => {
        const rowId = row.querySelector('.bi-eye')?.getAttribute('data-id');
        if (!rowId) return;
        
        const resident = residents.find(r => r.id === rowId);
        if (!resident) return;
        
        // Check if search term is in any of the main row text
        const rowText = row.textContent.toLowerCase();
        
        // Check if search term matches plates, parking spots, or storage unit
        const matchesPlates = resident.placaVehiculos?.some(plate => 
            plate.toLowerCase().includes(searchTerm)
        ) || false;
        
        const matchesParking = resident.parqueaderos?.some(spot => 
            spot.toLowerCase().includes(searchTerm)
        ) || false;
        
        const matchesStorage = resident.cuartoUtil?.toLowerCase().includes(searchTerm) || false;
        
        // Show row if any criteria matches
        row.style.display = (
            rowText.includes(searchTerm) || 
            matchesPlates || 
            matchesParking || 
            matchesStorage
        ) ? '' : 'none';
    });
}

// Export functions
function exportToPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get the unit name
    const unit = currentUser ? residentialUnits.find(u => u.username === currentUser.username) : null;
    const unitName = unit ? unit.name : 'Unidad Residencial';
    
    let title, data, headers;
    
    if (type === 'visitantes') {
        title = 'Historial de Visitantes';
        headers = ['Nombre', 'Apartamento', 'Ingreso', 'Salida', 'Medio', 'Placa'];
        
        // Get data for current unit
        data = visitorsHistory.filter(v => v.unit === (currentUser ? currentUser.username : 'admin'))
            .map(v => [
                v.nombre,
                v.apartamento,
                new Date(v.horaIngreso).toLocaleString('es-ES'),
                new Date(v.horaSalida).toLocaleString('es-ES'),
                v.medioTransporte,
                v.placa || '-'
            ]);
    } else {
        title = 'Historial de Paquetes';
        headers = ['Destinatario', 'Apartamento', 'Remitente', 'Recibido', 'Entregado'];
        
        // Get data for current unit
        data = packagesHistory.filter(p => p.unit === (currentUser ? currentUser.username : 'admin'))
            .map(p => [
                p.destinatario,
                p.apartamento,
                p.remitente,
                new Date(p.fechaRecibido).toLocaleString('es-ES'),
                new Date(p.fechaEntregado).toLocaleString('es-ES')
            ]);
    }
    
    // Set title
    doc.setFontSize(18);
    doc.text(unitName, 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(title, 105, 25, { align: 'center' });
    
    // Add current date
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 35, { align: 'center' });
    
    // Create table
    if (data.length > 0) {
        doc.autoTable({
            startY: 40,
            head: [headers],
            body: data,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [73, 109, 167] }
        });
    } else {
        doc.setFontSize(12);
        doc.text('No hay datos para mostrar', 105, 50, { align: 'center' });
    }
    
    // Generate and download PDF
    doc.save(`${type}_${unitName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportToExcel(type) {
    let data, fileName, sheetName;
    
    // Get the unit name
    const unit = currentUser ? residentialUnits.find(u => u.username === currentUser.username) : null;
    const unitName = unit ? unit.name : 'Unidad_Residencial';
    
    if (type === 'visitantes') {
        sheetName = 'Historial_Visitantes';
        fileName = `visitantes_${unitName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        // Get data for current unit
        const visitorsData = visitorsHistory.filter(v => v.unit === (currentUser ? currentUser.username : 'admin'))
            .map(v => ({
                Nombre: v.nombre,
                Documento: v.documento || '-',
                Apartamento: v.apartamento,
                Autorizado_Por: v.autoriza,
                Ingreso: new Date(v.horaIngreso).toLocaleString('es-ES'),
                Salida: new Date(v.horaSalida).toLocaleString('es-ES'),
                Medio_Transporte: v.medioTransporte,
                Placa: v.placa || '-',
                Observaciones: v.observaciones || '-'
            }));
        
        data = visitorsData;
    } else {
        sheetName = 'Historial_Paquetes';
        fileName = `paquetes_${unitName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        // Get data for current unit
        const packagesData = packagesHistory.filter(p => p.unit === (currentUser ? currentUser.username : 'admin'))
            .map(p => ({
                Destinatario: p.destinatario,
                Apartamento: p.apartamento,
                Remitente: p.remitente,
                Recibido: new Date(p.fechaRecibido).toLocaleString('es-ES'),
                Entregado: new Date(p.fechaEntregado).toLocaleString('es-ES'),
                Observaciones: p.observaciones || '-'
            }));
        
        data = packagesData;
    }
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate and download Excel file
    XLSX.writeFile(workbook, fileName);
}

// Dynamic fields functions
function addDynamicField(listId, value = '') {
    const list = document.getElementById(listId);
    const itemDiv = document.createElement('div');
    itemDiv.className = 'input-group mb-2';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.value = value;
    
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'input-group-append';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-outline-danger';
    removeButton.type = 'button';
    removeButton.innerHTML = '<i class="bi bi-dash-circle"></i>';
    removeButton.onclick = function() {
        list.removeChild(itemDiv);
    };
    
    buttonDiv.appendChild(removeButton);
    itemDiv.appendChild(input);
    itemDiv.appendChild(buttonDiv);
    list.appendChild(itemDiv);
}

function getMultipleFieldValues(listId) {
    const list = document.getElementById(listId);
    const inputs = list.querySelectorAll('input');
    const values = [];
    
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            values.push(input.value.trim());
        }
    });
    
    return values;
}

function clearDynamicFields(listId) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
}