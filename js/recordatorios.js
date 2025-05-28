// Función para cargar los recordatorios del usuario
async function cargarRecordatorios() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    console.log('Usuario no autenticado');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/recordatorios/${userId}`);
    const recordatorios = await response.json();
    
    if (response.ok) {
      mostrarRecordatorios(recordatorios);
    } else {
      console.error('Error al cargar recordatorios:', recordatorios.error);
    }
  } catch (error) {
    console.error('Error de conexión:', error);
  }
}

// Función para mostrar los recordatorios en la página
function mostrarRecordatorios(recordatorios) {
  debugger
  const contenedor = document.querySelector('.card-body');
  contenedor.innerHTML = ''; // Limpiar el contenedor

  if (recordatorios.length === 0) {
    contenedor.innerHTML = '<p class="text-muted">No tienes recordatorios programados.</p>';
    return;
  }

  recordatorios.forEach(recordatorio => {
    const recordatorioElement = document.createElement('div');
    recordatorioElement.className = 'd-flex justify-content-between align-items-center mb-3';
    
    const fechaFin = recordatorio.fecha_fin 
      ? ` - ${new Date(recordatorio.fecha_fin).toLocaleDateString('es-ES')}`
      : '';
    
    recordatorioElement.innerHTML = `
      <div>
        <h5 class="mb-1">${recordatorio.nombre_medicamento}</h5>
        <p class="text-muted small mb-0">
          <i class="bi bi-clock-history"></i> ${recordatorio.frecuencia} | 
          <i class="bi bi-alarm"></i> ${recordatorio.hora_programada} |
          <i class="bi bi-calendar"></i> ${new Date(recordatorio.fecha_inicio).toLocaleDateString('es-ES')}${fechaFin}
        </p>
        <p class="text-muted small mb-0">
          <i class="bi bi-capsule"></i> Dosis: ${recordatorio.dosis}
        </p>
      </div>
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-primary" onclick="editarRecordatorio(${recordatorio.id_recordatorio})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarRecordatorio(${recordatorio.id_recordatorio})">Eliminar</button>
      </div>
    `;
    
    contenedor.appendChild(recordatorioElement);
    contenedor.appendChild(document.createElement('hr'));
  });
}

// Función para crear nuevo recordatorio (existente)
document.querySelector('#nuevoRecordatorio form').addEventListener('submit', async (e) => {
  e.preventDefault();
  debugger
  const nombre_medicamento = document.getElementById('nombre_medicamento').value;
  const dosis = document.getElementById('dosis').value;
  const frecuencia = document.getElementById('frecuencia').value;
  const hora_programada = document.getElementById('hora_programada').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin = document.getElementById('fecha_fin').value;
  
  const formData = {
    id_usuario: sessionStorage.getItem('userId'),
    nombre_medicamento: nombre_medicamento,
    dosis: dosis,
    frecuencia: frecuencia,
    hora_programada: hora_programada,
    fecha_inicio: fecha_inicio,
    fecha_fin: fecha_fin || null
  };
console.log(formData);
  try {
    const response = await fetch('http://localhost:3001/api/recordatorios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Recordatorio creado exitosamente!');
      // Cerrar modal y recargar recordatorios
      bootstrap.Modal.getInstance(document.getElementById('nuevoRecordatorio')).hide();
      cargarRecordatorios();
    } else {
      alert(data.error || 'Error al guardar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor');
  }
});

// Funciones para editar y eliminar (puedes implementarlas luego)
function editarRecordatorio(id) {
  console.log('Editar recordatorio:', id);
  // Implementar lógica de edición
}

function eliminarRecordatorio(id) {
  console.log('Eliminar recordatorio:', id);
  // Implementar lógica de eliminación
}

// Cargar recordatorios cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario está logueado
  if (!sessionStorage.getItem('userId')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Mostrar/ocultar elementos según autenticación
  document.getElementById('activo').style.display = 'none';
  document.getElementById('inactivo').style.display = 'block';
  
  // Cargar recordatorios
  cargarRecordatorios();
  
  // Configurar botón de logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
});

// Función para cargar los datos en el modal de edición
async function editarRecordatorio(id) {
  try {
    debugger
    const response = await fetch(`http://localhost:3001/api/recordatorios/single/${id}`);
    const recordatorio = await response.json();
    
    if (response.ok) {
      // Llenar el formulario de edición con los datos
      document.getElementById('editId').value = recordatorio.id_recordatorio;
      document.getElementById('editNombre').value = recordatorio.nombre_medicamento;
      document.getElementById('editDosis').value = recordatorio.dosis;
      document.getElementById('editFrecuencia').value = recordatorio.frecuencia;
      document.getElementById('editHora').value = recordatorio.hora_programada;
      document.getElementById('editFechaInicio').value = recordatorio.fecha_inicio;
      document.getElementById('editFechaFin').value = recordatorio.fecha_fin || '';
      
      // Mostrar el modal
      const modal = new bootstrap.Modal(document.getElementById('editarRecordatorio'));
      modal.show();
    } else {
      alert('Error al cargar el recordatorio para editar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor');
  }
}

// Manejar el envío del formulario de edición
document.getElementById('formEditarRecordatorio').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    nombre_medicamento: document.getElementById('editNombre').value,
    dosis: document.getElementById('editDosis').value,
    frecuencia: document.getElementById('editFrecuencia').value,
    hora_programada: document.getElementById('editHora').value,
    fecha_inicio: document.getElementById('editFechaInicio').value,
    fecha_fin: document.getElementById('editFechaFin').value || null
  };

  const id = document.getElementById('editId').value;

  try {
    const response = await fetch(`http://localhost:3001/api/recordatorios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Recordatorio actualizado exitosamente!');
      // Cerrar modal y recargar recordatorios
      bootstrap.Modal.getInstance(document.getElementById('editarRecordatorio')).hide();
      cargarRecordatorios();
    } else {
      alert(data.error || 'Error al actualizar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor');
  }
});

// Función para mostrar confirmación de eliminación
function eliminarRecordatorio(id) {
  document.getElementById('recordatorioAEliminar').value = id;
  const modal = new bootstrap.Modal(document.getElementById('confirmarEliminar'));
  modal.show();
}

// Función para manejar la eliminación confirmada
document.getElementById('confirmarEliminarBtn').addEventListener('click', async () => {
  const id = document.getElementById('recordatorioAEliminar').value;
  
  try {
    const response = await fetch(`http://localhost:3001/api/recordatorios/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Recordatorio eliminado exitosamente!');
      // Cerrar modal y recargar recordatorios
      bootstrap.Modal.getInstance(document.getElementById('confirmarEliminar')).hide();
      cargarRecordatorios();
    } else {
      alert(data.error || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor');
  }
});