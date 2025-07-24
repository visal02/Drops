// Enhance card click functionality
    document.querySelectorAll('.card-option').forEach(card => {
      card.addEventListener('click', function() {
        // Add your navigation logic here
        console.log('Selected option: ' + this.querySelector('.card-title').textContent);
        // Example: window.location.href = '/create-form?type=' + encodeURIComponent(this.querySelector('.card-title').textContent);
      });
    });

    // Add animation on page load
    document.addEventListener('DOMContentLoaded', () => {
      const cards = document.querySelectorAll('.card-option');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1 + 0.3}s`;
      });
      
      // Add a style tag with the animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    });