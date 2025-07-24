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

    const newItem = document.createElement("li");
    newItem.innerHTML = `
      <a href="#"><i class="bi bi-tag-fill" style="color: ${labelColor}"></i> ${labelValue}</a>
    `;
    const allLi = labelList.querySelectorAll("li");
    const addBtnLi = Array.from(allLi).find(li => li.querySelector("button"));
    labelList.insertBefore(newItem, addBtnLi);

    labelInput.value = "";
    const modal = bootstrap.Modal.getInstance(document.getElementById("labelModal"));
    modal.hide();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    mobileMenuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  });