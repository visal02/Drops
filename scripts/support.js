 ScrollReveal({ 
        // reset: true,
        distance:'60px',
        duration:2500,
        delay:400
       });

       ScrollReveal().reveal('.main-title, .section-title', { delay: 500, origin:'left' });
       ScrollReveal().reveal('.sec-01 .image', { delay: 600, origin:'bottom' });
       ScrollReveal().reveal('.text-box', { delay: 700, origin:'right' });

document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('supportForm');
      const editor = document.getElementById('editor');
      const charCount = document.getElementById('charCount');
      const maxChars = 2000;
      const fileInput = document.getElementById('screenshot');
      const fileNameDisplay = document.getElementById('file-name');
      const imagePreviewContainer = document.getElementById('imagePreviewContainer');
      const imagePreview = document.getElementById('imagePreview');
      const removeImageBtn = document.getElementById('removeImageBtn');
      const successMessage = document.getElementById('successMessage');

      // Initialize editor with placeholder
      editor.addEventListener('focus', function() {
        if (this.innerHTML === this.getAttribute('data-placeholder')) {
          this.innerHTML = '';
        }
      });

      editor.addEventListener('blur', function() {
        if (this.innerHTML === '') {
          this.innerHTML = this.getAttribute('data-placeholder');
        }
      });

      // Set initial placeholder
      if (editor.innerHTML.trim() === '') {
        editor.innerHTML = editor.getAttribute('data-placeholder');
      }

      // Character count
      editor.addEventListener('input', function () {
        const text = this.innerText;
        const currentLength = text === editor.getAttribute('data-placeholder') ? 0 : text.length;
        charCount.textContent = currentLength;
        
        if (currentLength > maxChars) {
          charCount.style.color = 'var(--error-color)';
          this.classList.add('input-error');
        } else {
          charCount.style.color = '#666';
          this.classList.remove('input-error');
        }
      });

      // File upload handling
      fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          const file = this.files[0];
          
          // Check file size
          if (file.size > 5 * 1024 * 1024) {
            document.getElementById('fileError').style.display = 'block';
            fileNameDisplay.textContent = 'File too large (max 5MB)';
            fileNameDisplay.style.color = 'var(--error-color)';
            this.value = '';
            return;
          }

          fileNameDisplay.textContent = file.name;
          fileNameDisplay.style.color = '#666';
          document.getElementById('fileError').style.display = 'none';

          // Preview image if it's an image file
          if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function (e) {
              imagePreview.src = e.target.result;
              imagePreviewContainer.style.display = 'block';
            }
            reader.readAsDataURL(file);
          } else {
            imagePreviewContainer.style.display = 'none';
          }
        }
      });

      // Remove image
      removeImageBtn.addEventListener('click', function () {
        fileInput.value = '';
        fileNameDisplay.textContent = 'No file chosen';
        fileNameDisplay.style.color = '#666';
        imagePreviewContainer.style.display = 'none';
        document.getElementById('fileError').style.display = 'none';
      });

      // Drag and drop for file upload
      const fileUploadLabel = document.querySelector('.file-upload-label');

      fileUploadLabel.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.style.backgroundColor = '#e0e0e0';
        this.style.borderColor = 'var(--primary-color)';
      });

      fileUploadLabel.addEventListener('dragleave', function () {
        this.style.backgroundColor = 'var(--light-gray)';
        this.style.borderColor = 'var(--border-color)';
      });

      fileUploadLabel.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.backgroundColor = 'var(--light-gray)';
        this.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          const event = new Event('change');
          fileInput.dispatchEvent(event);
        }
      });

      // Form submission
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        let message = editor.innerHTML.trim();
        const link = document.getElementById("link").value.trim();
        const screenshot = document.getElementById("screenshot").files[0];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        // Reset error states
        document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // Validate name
        if (!name) {
          document.getElementById('nameError').style.display = 'block';
          document.getElementById('name').classList.add('input-error');
          isValid = false;
        }

        // Validate email
        if (!email || !emailRegex.test(email)) {
          document.getElementById('emailError').style.display = 'block';
          document.getElementById('email').classList.add('input-error');
          isValid = false;
        }

        // Validate editor content
        if (message === '' || message === editor.getAttribute('data-placeholder')) {
          document.getElementById('editorError').style.display = 'block';
          editor.classList.add('input-error');
          isValid = false;
        }

        // Validate URL if provided
        if (link && !/^https?:\/\/.+\..+/.test(link)) {
          document.getElementById('linkError').style.display = 'block';
          document.getElementById('link').classList.add('input-error');
          isValid = false;
        }

        if (isValid) {
          // Here you would typically send the form data to your server
          // For demonstration, we'll just show the success message
          form.style.display = 'none';
          successMessage.style.display = 'block';
          
          // Scroll to success message
          successMessage.scrollIntoView({ behavior: 'smooth' });
        }
      });

      // Formatting functions for the editor
      window.format = function(command, value = null) {
        document.execCommand(command, false, value);
        
        // Special handling for links
        if (command === 'createLink') {
          const url = prompt('Enter the URL:');
          if (url) {
            document.execCommand('createLink', false, url);
          }
        }
        
        editor.focus();
      };
    });