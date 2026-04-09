// js/script.js - Shared modal functionality for all galleries

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

// Close modal when pressing ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        const modal = document.getElementById('modal');
        if (modal && modal.style.display === 'flex') {
            closeModal();
        }
    }
});

// Make functions available to all gallery pages
window.openModal = openModal;
window.closeModal = closeModal;