  ScrollReveal({ 
        // reset: true,
        distance:'60px',
        duration:2500,
        delay:400
       });

       ScrollReveal().reveal('.main-title, .section-title', { delay: 500, origin:'left' });
       ScrollReveal().reveal('.sec-01 .image', { delay: 600, origin:'bottom' });
 
 // Simple JavaScript for template interaction
    document.querySelectorAll('.btn-template').forEach(button => {GenZDiv
    
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const templateName = this.closest('.template-card').querySelector('.template-title').textContent;
        alert(`You selected the "${templateName}" template!`);
      });
    });
