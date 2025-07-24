 // Current user data (temporary for session)
    let currentUser = null;
    let registeredUsers = [];

    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
      // Check if user is already logged in
      if (currentUser) {
        window.location.href = "./dashboard.html";
        
      }
    });

    function showForm(id) {
      document.querySelectorAll('.form-box').forEach(el => {
        el.classList.remove('active');
      });
      document.getElementById(id).classList.add('active');
      clearMessages();
    }

    function clearMessages() {
      document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
      });
    }

    function showError(formId, message) {
      const errorEl = document.getElementById(formId + 'Error');
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    function showSuccess(formId, message) {
      const successEl = document.getElementById(formId + 'Success');
      successEl.textContent = message;
      successEl.style.display = 'block';
    }

    function handleLogin() {
      const email = document.getElementById("loginEmail").value.trim();
      const pass = document.getElementById("loginPass").value;

      // Clear previous messages
      clearMessages();

      if (!email || !pass) {
        showError('login', 'Please fill in all fields');
        return;
      }

      if (!validateEmail(email)) {
        showError('login', 'Invalid email format');
        return;
      }

      // Check against registered users
      const user = registeredUsers.find(u => u.email === email && u.password === pass);
      
      if (user) {
        currentUser = user;
        // Redirect to dashboard page
        window.location.href = "/page/dashboard/index.html";
      } else {
        showError('login', 'Email or Password is incorrect');
      }
    }

    function handleRegistration() {
      const userData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPass").value,
        registeredAt: new Date().toISOString()
      };

      const confirmPass = document.getElementById("confirmPass").value;

      // Validation
      if (!userData.firstName || !userData.lastName || !userData.gender || !userData.dob || 
          !userData.email || !userData.password || !confirmPass) {
        showError('reg', 'Please fill all fields');
        return;
      }

      if (!validateEmail(userData.email)) {
        showError('reg', 'Invalid email format');
        return;
      }

      if (!validatePassword(userData.password)) {
        showError('reg', 'Password must have 8+ characters with letters and numbers');
        return;
      }

      if (userData.password !== confirmPass) {
        showError('reg', 'Passwords do not match');
        return;
      }

      // Check if email already exists
      if (registeredUsers.some(u => u.email === userData.email)) {
        showError('reg', 'Email already registered');
        return;
      }

      // Register the user (in memory)
      registeredUsers.push(userData);
      
      // Show success and switch to login
      showForm('loginForm');
      showSuccess('login', 'Registration successful! Please login');
      document.getElementById("loginEmail").value = userData.email;
    }

    function handleForgotPassword() {
      const email = document.getElementById("forgotEmail").value.trim();
      
      if (!email) {
        showError('forgot', 'Please enter your email');
        return;
      }

      if (!validateEmail(email)) {
        showError('forgot', 'Invalid email format');
        return;
      }

      // Check if email exists
      if (registeredUsers.some(u => u.email === email)) {
        showSuccess('forgot', `Reset link sent to ${email} (simulated)`);
      } else {
        showError('forgot', 'Email not found');
      }
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
    }

    function validatePassword(password) {
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
    }

    function togglePassword(fieldId) {
      const field = document.getElementById(fieldId);
      field.type = field.type === 'password' ? 'text' : 'password';
    }