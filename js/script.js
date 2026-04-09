// script.js - Shared functionality for all galleries

function openModal(photo) {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');

    modalImg.src = photo.src;
    modalTitle.textContent = photo.title;
    modalDesc.textContent = photo.desc;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Make functions available globally
window.openModal = openModal;
window.closeModal = closeModal;