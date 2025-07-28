ScrollReveal({ 
        // reset: true,
        distance:'60px',
        duration:2500,
        delay:400
       });

       ScrollReveal().reveal('.main-title, .section-title', { delay: 500, origin:'left' });
       ScrollReveal().reveal('.sec-01 .image, .info', { delay: 600, origin:'bottom' });
       ScrollReveal().reveal('.text-box', { delay: 700, origin:'right' });
       ScrollReveal().reveal('.sec-02 .image', { delay: 500, origin:'top'});

document.addEventListener('DOMContentLoaded', function() {
      const monthlyBtn = document.getElementById('monthlyBtn');
      const yearlyBtn = document.getElementById('yearlyBtn');
      
      // Initially show monthly pricing
      showMonthlyPricing();
      
      monthlyBtn.addEventListener('click', function() {
        monthlyBtn.classList.add('btn-primary', 'btn-toggle');
        yearlyBtn.classList.remove('btn-primary', 'btn-toggle');
        yearlyBtn.classList.add('btn-light');
        showMonthlyPricing();
      });
      
      yearlyBtn.addEventListener('click', function() {
        yearlyBtn.classList.add('btn-primary', 'btn-toggle');
        monthlyBtn.classList.remove('btn-primary', 'btn-toggle');
        monthlyBtn.classList.add('btn-light');
        showYearlyPricing();
      });
      
      function showMonthlyPricing() {
        // Show monthly pricing elements
        const monthlyElements = document.querySelectorAll('.monthly-pricing');
        monthlyElements.forEach(el => el.style.display = 'block');
        
        // Hide yearly pricing elements
        const yearlyElements = document.querySelectorAll('.yearly-pricing');
        yearlyElements.forEach(el => el.style.display = 'none');
      }
      
      function showYearlyPricing() {
        // Show yearly pricing elements
        const yearlyElements = document.querySelectorAll('.yearly-pricing');
        yearlyElements.forEach(el => el.style.display = 'block');
        
        // Hide monthly pricing elements
        const monthlyElements = document.querySelectorAll('.monthly-pricing');
        monthlyElements.forEach(el => el.style.display = 'none');
      }
    });

    document.addEventListener('click',function(){
      const signup = document.getElementsByClassName('.sign-up');
              window.location.href = "/page/login/index.html";
    })