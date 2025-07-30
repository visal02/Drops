let projectData = JSON.parse(localStorage.getItem('projectData')) || {
    all: [
      { id: 1, name: "Project A", description: "A creative design project" },
      { id: 2, name: "Project B", description: "A marketing campaign" }
    ],
    favorites: [
      { id: 3, name: "Favorite Project", description: "A starred project" }
    ],
    archive: [],
    trash: []
  };

  let labels = JSON.parse(localStorage.getItem('labels')) || [];

  function saveToLocalStorage() {
    localStorage.setItem('projectData', JSON.stringify(projectData));
    localStorage.setItem('labels', JSON.stringify(labels));
  }

  function addLabel() {
    const labelInput = document.getElementById("newLabel");
    const colorInput = document.getElementById("labelColor");
    const labelValue = labelInput.value.trim();
    const labelColor = colorInput.value;
    const labelList = document.getElementById("label-list");

    if (labelValue === "") {
      alert("Please enter a label name");
      return;
    }

    const existingLabels = labelList.querySelectorAll("a");
    for (const label of existingLabels) {
      const text = label.textContent.trim().toLowerCase();
      if (text === labelValue.toLowerCase()) {
        alert("This label already exists.");
        return;
      }
    }

    // Create label key and add to projectData
    const labelKey = labelValue.toLowerCase().replace(/\s+/g, '-');
    projectData[labelKey] = [];

    // Add to labels array
    const newLabel = { name: labelValue, color: labelColor, key: labelKey };
    labels.push(newLabel);

    // Create new label element
    const newItem = document.createElement("li");
    newItem.innerHTML = `
      <div class="label-content d-flex justify-content-between align-items-center">
        <a href="#" data-label="${labelKey}">
          <i class="bi bi-tag-fill label-icon" style="color: ${labelColor}"></i> 
          <span class="label-text">${labelValue}</span>
        </a>
        <div class="label-actions">
          <button class="btn btn-sm btn-outline-primary edit-label" title="Edit label" data-label-key="${labelKey}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-label" title="Delete label" data-label-key="${labelKey}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
    
    const allLi = labelList.querySelectorAll("li");
    const addBtnLi = Array.from(allLi).find(li => li.querySelector("button"));
    labelList.insertBefore(newItem, addBtnLi);

    // Save to localStorage
    saveToLocalStorage();

    // Clear modal and hide
    labelInput.value = "";
    const modal = bootstrap.Modal.getInstance(document.getElementById("labelModal"));
    modal.hide();

    // Add click event to the new label
    newItem.querySelector("a").addEventListener("click", (e) => handleLabelClick(e, labelKey));
    
    // Add edit and delete event listeners
    newItem.querySelector(".edit-label").addEventListener("click", (e) => editLabel(e, newLabel));
    newItem.querySelector(".delete-label").addEventListener("click", (e) => deleteLabel(e, labelKey));
  }

  function editLabel(event, label) {
    event.stopPropagation();
    
    // Create modal for editing
    const editModal = document.createElement('div');
    editModal.className = 'modal fade';
    editModal.id = 'editLabelModal';
    editModal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-fill me-2"></i> Edit Label</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="editLabelName" class="form-label">Label Name</label>
              <input type="text" class="form-control" id="editLabelName" value="${label.name}">
            </div>
            <div class="mb-3">
              <label for="editLabelColor" class="form-label">Label Color</label>
              <select class="form-select" id="editLabelColor">
                <option value="#6c5ce7" ${label.color === '#6c5ce7' ? 'selected' : ''}>Purple</option>
                <option value="#00b894" ${label.color === '#00b894' ? 'selected' : ''}>Teal</option>
                <option value="#0984e3" ${label.color === '#0984e3' ? 'selected' : ''}>Blue</option>
                <option value="#fd79a8" ${label.color === '#fd79a8' ? 'selected' : ''}>Pink</option>
                <option value="#fdcb6e" ${label.color === '#fdcb6e' ? 'selected' : ''}>Yellow</option>
                <option value="#e17055" ${label.color === '#e17055' ? 'selected' : ''}>Orange</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" id="saveEditLabel">Save Changes</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(editModal);
    
    const modal = new bootstrap.Modal(editModal);
    modal.show();
    
    // Handle save changes
    document.getElementById('saveEditLabel').addEventListener('click', () => {
      const newName = document.getElementById('editLabelName').value.trim();
      const newColor = document.getElementById('editLabelColor').value;
      
      if (!newName) {
        alert('Label name cannot be empty');
        return;
      }
      
      // Update label in labels array
      const labelIndex = labels.findIndex(l => l.key === label.key);
      if (labelIndex !== -1) {
        labels[labelIndex].name = newName;
        labels[labelIndex].color = newColor;
      }
      
      // Update in projectData (change the key if name changed)
      if (label.name !== newName) {
        const newKey = newName.toLowerCase().replace(/\s+/g, '-');
        projectData[newKey] = projectData[label.key] || [];
        delete projectData[label.key];
        labels[labelIndex].key = newKey;
      }
      
      // Update the UI
      const labelElement = document.querySelector(`a[data-label="${label.key}"]`);
      if (labelElement) {
        if (label.name !== newName) {
          labelElement.setAttribute('data-label', newName.toLowerCase().replace(/\s+/g, '-'));
        }
        labelElement.querySelector('.label-text').textContent = newName;
        labelElement.querySelector('.label-icon').style.color = newColor;
      }
      
      saveToLocalStorage();
      modal.hide();
      editModal.remove();
    });
    
    // Remove modal when closed
    editModal.addEventListener('hidden.bs.modal', () => {
      editModal.remove();
    });
  }

  function deleteLabel(event, labelKey) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this label? Projects will not be deleted.')) {
      // Remove from labels array
      labels = labels.filter(label => label.key !== labelKey);
      
      // Remove from projectData (keep the projects under this label)
      delete projectData[labelKey];
      
      // Remove from UI
      const labelItem = event.target.closest('li');
      if (labelItem) {
        labelItem.remove();
      }
      
      saveToLocalStorage();
    }
  }

  function handleLabelClick(event, labelKey) {
    event.preventDefault();

    // Remove active class from all labels
    const labelList = document.getElementById("label-list");
    const allLabels = labelList.querySelectorAll("a");
    allLabels.forEach(label => label.classList.remove("active"));

    // Add active class to clicked label
    event.target.closest("a").classList.add("active");

    // Update dashboard content
    const contentArea = document.getElementById("content-area");
    const projects = projectData[labelKey] || [];

    if (projects.length === 0) {
      contentArea.innerHTML = `
        <div class="welcome-container">
          <div class="loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Add projects to this label to see them here.</p>
          <a href="/page/create/index.html" class="btn btn-danger btn-lg px-4">
            <i class="bi bi-plus-lg"></i> Create New Project
          </a>
        </div>
      `;
    } else {
      contentArea.innerHTML = `
        <h2>Projects in ${labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}</h2>
        <div class="row">
          ${projects.map(project => `
            <div class="col-md-4 mb-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">${project.name}</h5>
                  <p class="card-text">${project.description}</p>
                  <a href="#" class="btn btn-primary">View Project</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  function loadLabelsFromStorage() {
    const labelList = document.getElementById("label-list");
    const allLi = labelList.querySelectorAll("li");
    const addBtnLi = Array.from(allLi).find(li => li.querySelector("button"));

    labels.forEach(label => {
      const newItem = document.createElement("li");
      newItem.innerHTML = `
        <div class="label-content d-flex justify-content-between align-items-center">
          <a href="#" data-label="${label.key}">
            <i class="bi bi-tag-fill label-icon" style="color: ${label.color}"></i> 
            <span class="label-text">${label.name}</span>
          </a>
          <div class="label-actions">
            <button class="btn btn-sm btn-outline-primary edit-label" title="Edit label" data-label-key="${label.key}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-label" title="Delete label" data-label-key="${label.key}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      labelList.insertBefore(newItem, addBtnLi);
      
      // Add event listeners
      newItem.querySelector("a").addEventListener("click", (e) => handleLabelClick(e, label.key));
      newItem.querySelector(".edit-label").addEventListener("click", (e) => editLabel(e, label));
      newItem.querySelector(".delete-label").addEventListener("click", (e) => deleteLabel(e, label.key));
    
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    // Load labels from localStorage
    loadLabelsFromStorage();

    // Add click events to existing labels
    const labelList = document.getElementById("label-list");
    const allLabels = labelList.querySelectorAll("a");
    allLabels.forEach(label => {
      const labelKey = label.getAttribute("data-label");
      if (labelKey) {
        label.addEventListener("click", (e) => handleLabelClick(e, labelKey));
      }
    });

    // Handle categories (Favorites, Archive, Trash)
    const categoryLinks = document.querySelectorAll(".sidebar ul:not(#label-list) a");
    categoryLinks.forEach(link => {
      const labelKey = link.getAttribute("data-label");
      if (labelKey) {
        link.addEventListener("click", (e) => handleLabelClick(e, labelKey));
      }
    });

    // Mobile menu toggle
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
      });
    }

    overlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  });