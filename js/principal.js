document.addEventListener('DOMContentLoaded', () => {
const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
const recordatoriosItem = document.getElementById('nav-Recordatorios');
const activo = document.getElementById('activo');
const inactivo = document.getElementById('inactivo');

if (isAuth) {
recordatoriosItem.classList.remove('hidden-item');
activo.classList.add('hidden-item');
inactivo.classList.remove('hidden-item');

} else {
recordatoriosItem.classList.add('hidden-item');
activo.classList.remove('hidden-item');
inactivo.classList.add('hidden-item');

}

});

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.setItem('isAuthenticated', 'false');
  window.location.reload();

    window.location.href = '/'; // Redirige al inicio
});