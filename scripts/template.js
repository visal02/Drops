 // Simple JavaScript for template interaction
    document.querySelectorAll('.btn-template').forEach(button => {GenZDiv
    
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const templateName = this.closest('.template-card').querySelector('.template-title').textContent;
        alert(`You selected the "${templateName}" template!`);
      });
    });