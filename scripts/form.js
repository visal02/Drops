// Hide all publish-hide elements
$(".publish-hide").hide();

// Show the build element
$("#build").show();

// Show the publish element
$("#publish").show();
// Local Storage Functions
$("#publish").click(function(){
  $(".publish-hide").show();

})

function saveFormToLocalStorage() {
  const formData = {
    elements: [],
    createdAt: new Date().toISOString(),
  };

  $(".form-element").each(function () {
    const element = $(this);
    const type = element.data("type");
    const id = element.data("id");
    const elementData = {
      type: type,
      id: id,
      settings: {},
      options: [],
      roles: [],
    };

    element.find("[data-setting]").each(function () {
      const input = $(this);
      elementData.settings[input.data("setting")] = input.is(":checkbox")
        ? input.prop("checked")
        : input.val();
    });

    element.find("[data-option]").each(function () {
      elementData.options.push($(this).val());
    });

    element.find("[data-role]").each(function () {
      elementData.roles.push($(this).val());
    });

    formData.elements.push(elementData);
  });

  localStorage.setItem("savedForm", JSON.stringify(formData));
}

function loadFormFromLocalStorage() {
  const savedForm = localStorage.getItem("savedForm");
  if (savedForm) {
    const formData = JSON.parse(savedForm);

    // Clear existing form
    $("#formElements").empty();

    // Rebuild form from saved data
    formData.elements.forEach((elementData) => {
      addFormElement(elementData.type, elementData);
    });

    // Remove empty message if elements were loaded
    if (formData.elements.length > 0) {
      $("#formElements .empty-message").remove();
    }
  }
}

function typeToLabel(type) {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function updateTooltipAndHelpButton(elementDiv, helpText) {
  const tooltipTrigger = elementDiv.find('[data-bs-toggle="tooltip"]');
  const helpButton = elementDiv.find(".help-button");

  if (tooltipTrigger.length && helpButton.length) {
    const hasHelpText = helpText && helpText.trim().length > 0;
    tooltipTrigger.attr("title", hasHelpText ? helpText : "");
    const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTrigger[0]);
    if (tooltipInstance) {
      if (hasHelpText) {
        tooltipInstance.setContent({ ".tooltip-inner": helpText });
        tooltipInstance.enable();
      } else {
        tooltipInstance.disable();
      }
    } else if (hasHelpText) {
      new bootstrap.Tooltip(tooltipTrigger[0], {
        title: helpText,
      });
    }
    helpButton.css("display", hasHelpText ? "inline-block" : "none");
  }
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...$(container).find(".form-element:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function updatePreview(elementDiv) {
  const type = elementDiv.data("type");
  const id = elementDiv.data("id");
  const settings = {};

  elementDiv.find("[data-setting]").each(function () {
    const input = $(this);
    settings[input.data("setting")] = input.is(":checkbox")
      ? input.prop("checked")
      : input.val();
  });

  const options = [];
  elementDiv.find("[data-option]").each(function () {
    options.push($(this).val());
  });

  switch (type) {
    case "text":
    case "textarea":
    case "email":
    case "password":
    case "number":
    case "date":
    case "file":
    case "autocomplete":
    case "hiddenInput":
      const label = elementDiv.find(".field-label");
      const input = elementDiv.find(".field-control");

      if (label.length && settings.label) {
        label.text(settings.label);
        label.toggleClass("required-field", settings.required);
      }

      if (input.length) {
        if (settings.placeholder) {
          input.attr("placeholder", settings.placeholder);
        } else {
          input.removeAttr("placeholder");
        }

        input.attr(
          "class",
          "field-control" + (settings.class ? " " + settings.class : "")
        );
        input.attr("name", settings.name || id);
        input.attr("id", settings.name || id);
        input.prop("required", settings.required || false);

        if (type === "number") {
          if (settings.min) input.attr("min", settings.min);
          else input.removeAttr("min");
          if (settings.max) input.attr("max", settings.max);
          else input.removeAttr("max");
          if (settings.step) input.attr("step", settings.step);
          else input.removeAttr("step");
        } else if (type === "date") {
          if (settings.minDate) input.attr("min", settings.minDate);
          else input.removeAttr("min");
          if (settings.maxDate) input.attr("max", settings.maxDate);
          else input.removeAttr("max");
        } else if (type === "email" || type === "password") {
          if (settings.pattern) input.attr("pattern", settings.pattern);
          else input.removeAttr("pattern");
          if (type === "password") {
            if (settings.minlength) input.attr("minlength", settings.minlength);
            else input.removeAttr("minlength");
            if (settings.maxlength) input.attr("maxlength", settings.maxlength);
            else input.removeAttr("maxlength");
          }
        } else if (type === "file") {
          if (settings.accept) input.attr("accept", settings.accept);
          else input.removeAttr("accept");
          input.prop("multiple", settings.multiple || false);
        } else if (type === "hiddenInput") {
          if (settings.value) input.attr("value", settings.value);
          else input.removeAttr("value");
        }
      }

      updateTooltipAndHelpButton(elementDiv, settings.helpText);
      break;

    case "checkbox-group":
    case "radio-group":
      const groupLabel = elementDiv.find(".field-label");
      const optionContainer = elementDiv.find(
        `.${type === "checkbox-group" ? "checkbox-options" : "radio-options"}`
      );

      if (groupLabel.length && settings.label) {
        groupLabel.text(settings.label);
        groupLabel.toggleClass("required-field", settings.required);
      }

      if (optionContainer.length) {
        optionContainer.empty();
        options.forEach((opt, index) => {
          const optionId = `${settings.name || id}-option${index + 1}`;
          const optionValue = opt || `option${index + 1}`;
          optionContainer.append(`
                  <div class="option-item">
                    <input type="${
                      type === "checkbox-group" ? "checkbox" : "radio"
                    }" 
                           id="${optionId}" 
                           name="${settings.name || id}" 
                           value="${optionValue}"
                           ${
                             settings.required && type === "radio-group"
                               ? "required"
                               : ""
                           }>
                    <label for="${optionId}">${
            opt || `Option ${index + 1}`
          }</label>
                  </div>
                `);
        });
      }

      updateTooltipAndHelpButton(elementDiv, settings.helpText);
      break;

   case "select":
  const selectLabel = elementDiv.find(".field-label");
  const select = elementDiv.find("select");

  if (selectLabel.length && settings.label) {
    selectLabel.text(settings.label);
    selectLabel.toggleClass("required-field", settings.required);
  }

  if (select.length) {
    select.empty();
    options.forEach((opt, index) => {
      const value = opt || `option${index + 1}`;
      const text = opt || `Option ${index + 1}`;
      select.append(`<option value="${value}">${text}</option>`);
    });

    select.attr("class", `field-control ${settings.class || ""}`);
    select.attr("name", settings.name || id);
    select.attr("id", settings.name || id);
    select.prop("required", settings.required || false);
    select.prop("multiple", settings.multiple || false);
  }

  case "input-button":
  const inputButton = elementDiv.find("input[type='button']");
  if (inputButton.length) {
    inputButton.val(settings.buttonText || "Button");
    inputButton.attr("class", `field-control btn ${settings.buttonStyle || "btn-primary"} ${settings.class || ""}`);
    inputButton.attr("name", settings.name || id);
    inputButton.attr("id", settings.name || id);
  }
  break;

      case "star":
  const starContainer = elementDiv.find(".star-rating");
  const starLabel = elementDiv.find(".field-label");
  const starTextInput = elementDiv.find(".star-text-input");

  if (starLabel.length && settings.label) {
    starLabel.text(settings.label);
    starLabel.toggleClass("required-field", settings.required);
  }

  if (starTextInput.length) {
    starTextInput.attr("placeholder", settings.placeholder || "Enter comments...");
    starTextInput.attr("class", `field-control star-text-input ${settings.class || ""}`);
    starTextInput.attr("name", `${settings.name || id}-text`);
    starTextInput.attr("id", `${settings.name || id}-text`);
    starTextInput.prop("required", settings.requiredText || false);
  }

  if (starContainer.length) {
    starContainer.find("input").each(function () {
      const input = $(this);
      input.attr("name", settings.name || id);
      input.prop("required", settings.required || false);
    });
  }

  updateTooltipAndHelpButton(elementDiv, settings.helpText);
  break;
      

    case "header":
      const headerText = elementDiv.find("h1, h2, h3, h4, h5, h6");
      if (headerText.length) {
        const newHeader = $(`<${settings.headerLevel || "h5"}>`).text(
          settings.headerText || "Header"
        );
        headerText.replaceWith(newHeader);
      }
      break;

    case "paragraph":
      const paragraph = elementDiv.find("p");
      if (paragraph.length && settings.paragraphText) {
        paragraph.text(settings.paragraphText);
      }
      break;
  }
}

// Add form element to the form area
function addFormElement(type, savedData = null) {
  const elementCounter = Date.now();
  const id = savedData?.id || `${type}-${elementCounter}`;
  let elementHtml = "";
  let settingsHtml = "";
  const commonSettings = `
        <div class="setting-group">
          <label class="setting-label">
            <input type="checkbox" data-setting="required"> Required field
          </label>
        </div>
          <div class="setting-group">
            <label class="setting-label">Label</label>
              <input type="text" class="setting-control" value="${typeToLabel(
                type
              )}" data-setting="label">
          </div>
          <div class="setting-group">
            <label class="setting-label">Help Text</label>
              <input type="text" class="setting-control" data-setting="helpText" placeholder="Optional help text">
          </div>
          <div class="setting-group">
            <label class="setting-label">Placeholder</label>
              <input type="text" class="setting-control" data-setting="placeholder" placeholder="Optional placeholder">
          </div>
          <div class="setting-group">
            <label class="setting-label">Class</label>
              <input type="text" class="setting-control" value="" data-setting="class"placeholder="form-control">
          </div>
          <div class="setting-group">
            <label class="setting-label">Name/ID</label>
              <input type="text" class="setting-control" value="${id}" data-setting="name">
          </div>
        `;
        const commonSetting = `
          <div class="setting-group">
            <label class="setting-label">Label</label>
              <input type="text" class="setting-control" value="${typeToLabel(
                type
              )}" data-setting="label">
          </div>
          <div class="setting-group">
            <label class="setting-label">Class</label>
              <input type="text" class="setting-control" value="" data-setting="class"placeholder="form-control">
          </div>
          <div class="setting-group">
            <label class="setting-label">Name/ID</label>
              <input type="text" class="setting-control" value="${id}" data-setting="name">
          </div>
        `;
  switch (type) {
    case "text":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <input type="text" class="field-control" placeholder="Enter text">
            `;
      settingsHtml += `
            ${commonSettings}
            <div class="setting-group">
              <label class="setting-label">Value</label>
                <input type="text" class="setting-control" data-setting="value" />
            </div>
            <div class="setting-group">
              <label class="setting-label">Minimum Length</label>
                <input type="number" class="setting-control" data-setting="minlength">
            </div>
            <div class="setting-group">
              <label class="setting-label">Maximum Length</label>
                <input type="number" class="setting-control" data-setting="maxlength">
            </div>
            `;
      break;

    case "textarea":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <textarea class="field-control" rows="3" placeholder="Enter text"></textarea>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Minimum Value</label>
                  <input type="number" class="setting-control" data-setting="mintextarea">
              </div>
              <div class="setting-group">
                <label class="setting-label">Maximum Value</label>
                  <input type="number" class="setting-control" data-setting="maxtextarea">
              </div>
              <div class="setting-group">
                <label class="setting-label">Step</label>
                  <input type="number" class="setting-control" data-setting="step" value="1">
              </div>
              ${commonSettings}
              `;
      break;

    case "number":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <input type="number" class="field-control" placeholder="Enter number">
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Minimum Value</label>
                <input type="number" class="setting-control" data-setting="min">
              </div>
              <div class="setting-group">
                <label class="setting-label">Maximum Value</label>
                <input type="number" class="setting-control" data-setting="max">
              </div>
              <div class="setting-group">
                <label class="setting-label">Step</label>
                <input type="number" class="setting-control" data-setting="step" value="1">
              </div>
              ${commonSettings}
            `;
      break;

    case "date":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <input type="date" class="field-control">
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Minimum Date</label>
                <input type="date" class="setting-control" data-setting="minDate">
              </div>
              <div class="setting-group">
                <label class="setting-label">Maximum Date</label>
                <input type="date" class="setting-control" data-setting="maxDate">
              </div>
              ${commonSettings}
            `;
      break;

    case "email":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <div class="input-group">
                <input type="email" class="field-control" placeholder="Enter email">
                <div class="invalid-feedback">Please enter a valid email address.</div>
              </div>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Validation Pattern</label>
                <input type="text" class="setting-control" data-setting="pattern" placeholder="e.g., ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" value="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$">
              </div>
              ${commonSettings}`;
      break;

    case "password":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <div class="input-group">
                <input type="password" class="field-control" placeholder="Enter password">
                <button class="btn btn-outline-secondary toggle-password" type="button">
                  <i class="fas fa-eye"></i>
                </button>
                <div class="invalid-feedback">Password must meet the specified requirements.</div>
              </div>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Minimum Length</label>
                <input type="number" class="setting-control" data-setting="minlength" value="8">
              </div>
              <div class="setting-group">
                <label class="setting-label">Maximum Length</label>
                <input type="number" class="setting-control" data-setting="maxlength" value="128">
              </div>
              <div class="setting-group">
                <label class="setting-label">Validation Pattern</label>
                <input type="text" class="setting-control" data-setting="pattern" placeholder="e.g., ^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$" value="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$">
              </div>
              ${commonSettings}
            `;
      break;

    case "hiddenInput":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <input type="hidden" class="field-control">
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Value</label>
                <input type="text" class="setting-control" data-setting="value">
              </div>
              ${commonSettings}
            `;
      break;

    case "checkbox-group":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <div class="checkbox-options">
                <div class="option-item">
                  <input type="checkbox" id="${id}-option1" name="${id}">
                  <label for="${id}-option1">Option 1</label>
                </div>
                <div class="option-item">
                  <input type="checkbox" id="${id}-option2" name="${id}">
                  <label for="${id}-option2">Option 2</label>
                </div>
              </div>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Options</label>
                <div class="option-list">
                  <div class="option-item">
                    <input type="text" class="setting-control" value="Option 1" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                  <div class="option-item">
                    <input type="text" class="setting-control" value="Option 2" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                </div>
                <button class="add-option btn"><i class="bi bi-plus-square-dotted"></i> Add Option</button>
              </div>
              ${commonSettings}
            `;
      break;

    case "radio-group":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <div class="radio-options">
                <div class="option-item">
                  <input type="radio" id="${id}-option1" name="${id}" value="option1">
                  <label for="${id}-option1">Option 1</label>
                </div>
                <div class="option-item">
                  <input type="radio" id="${id}-option2" name="${id}" value="option2">
                  <label for="${id}-option2">Option 2</label>
                </div>
              </div>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Options</label>
                <div class="option-list">
                  <div class="option-item">
                    <input type="text" class="setting-control" value="Option 1" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                  <div class="option-item">
                    <input type="text" class="setting-control" value="Option 2" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                </div>
                <div class="text-end shrink-0">
                <button class="add-option btn"><i class="bi bi-plus-square-dotted"></i> Add Option</button>
                </div>
              </div>
              ${commonSettings}
            `;
      break;

    case "select":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
              </div>
              <select class="field-control">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">Options</label>
                <div class="option-list">
                  <div class="option-item">
                    <input type="text" class="setting-control" value="Option 1" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                  <div class="option-item">
                    <input type="text" class="setting-control" value="Option 2" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                </div>
                <span class="add-option"><i class="bi bi-plus-square-dotted"></i> Add Option</span>
              </div>
              <div class="setting-group">
                <label class="setting-label">
                  <input type="checkbox" data-setting="multiple"> Allow multiple selections
                </label>
              </div>
              ${commonSetting}
            `;
      break;

   case "input-button":
      elementHtml = `
        <input type="button" class="field-control btn btn-primary" value="Button" data-setting="buttonText">
      `;
      settingsHtml = `
        <div class="setting-group">
          <label class="setting-label">Button Text</label>
          <input type="text" class="setting-control" value="Button" data-setting="buttonText">
        </div>
        <div class="setting-group">
          <label class="setting-label">Button Style</label>
          <select class="setting-control" data-setting="buttonStyle">
            <option value="btn-primary" selected>Primary</option>
            <option value="btn-secondary">Secondary</option>
            <option value="btn-success">Success</option>
            <option value="btn-danger">Danger</option>
            <option value="btn-warning">Warning</option>
            <option value="btn-info">Info</option>
            <option value="btn-light">Light</option>
            <option value="btn-dark">Dark</optionenem>
          </select>
        </div>
        ${commonSetting}
      `;
      break;

    case "file":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <div class="input-group">
                <input type="file" class="field-control d-none" id="file-${id}">
                <button type="button" class="btn btn-primary file-upload-btn" data-bs-toggle="tooltip" title="Upload a file">Upload File</button>
                <span class="file-name ms-2" style="line-height: 38px;"></span>
              </div>
            `;
      settingsHtml += `
              <div class="setting-group">
                <label class="setting-label">
                  <input type="checkbox" data-setting="multiple"> Allow multiple files
                </label>
              </div>
              <div class="setting-group">
                <label class="setting-label">Accepted File Types</label>
                <input type="text" class="setting-control" data-setting="accept" placeholder=".jpg,.png,.pdf">
              </div>
              ${commonSettings}
            `;
      break;

    case "header":
      elementHtml = `
              <h3>Header</h3>
            `;
      settingsHtml = `
              <div class="setting-group">
                <label class="setting-label">${typeToLabel(type)}</label>
                <input type="text" class="setting-control" value="Header" data-setting="headerText">
              </div>
              <div class="setting-group">
                <label class="setting-label">Header Level</label>
                <select class="setting-control" data-setting="headerLevel">
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                  <option value="h5" selected>H5</option>
                  <option value="h6">H6</option>
                </select>
              </div>
              ${commonSetting}
            `;
      break;

    case "paragraph":
      elementHtml = `
              <p>Paragraph text goes here.</p>
            `;
      settingsHtml = `
              <div class="setting-group">
                <label class="setting-label">Paragraph Text</label>
                <textarea class="setting-control" rows="3" data-setting="paragraphText">Paragraph text goes here.</textarea>
              </div>
              ${commonSetting}
            `;
      break;

  case "star":
  elementHtml = `
    <div class="field-content">
      <div class="help-text-container">
        <label class="field-label">${typeToLabel(type)}</label>
      </div>
      <div class="star-rating">
        ${[5, 4, 3, 2, 1].map(starValue => `
          <input type="radio" id="${id}-star${starValue}" name="${id}-rating" value="${starValue}">
          <label for="${id}-star${starValue}" class="fa fa-star"></label>
        `).join('')}
      </div>
    </div>
  `;
  settingsHtml = `
    ${commonSetting}
  `;
  break;

    case "autocomplete":
      elementHtml = `
              <div class="help-text-container">
                <label class="field-label">${typeToLabel(type)}</label>
                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                  <button class="help-button" type="button">?</button>
                </span>
              </div>
              <input type="text" class="field-control" placeholder="Start typing...">
            `;
      settingsHtml += `
      <label class="setting-label">Options</label>
      <div class="setting-group text-end">
      <div class="option-list">
      <div class="option-item">
      <input type="text" class="setting-control" value="Option 1" data-option>
      <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
      </div>
      <div class="option-item">
      <input type="text" class="setting-control" value="Option 2" data-option>
      <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
      </div>
      </div>
      <button class="add-option border-success btn-link" style="border-radius: 5px;" ><i class="bi bi-plus-square-dotted"></i> Add Option</button>
      </div>
      ${commonSettings}
              `;
      break;
  }

  const elementDiv = $(`
          <div class="form-element" data-type="${type}" data-id="${id}" draggable="true">
            <div class="element-actions">
              <button class="element-btn settings-btn" title="Settings"><i class="bi bi-pen-fill"></i></button>
              <button class="element-btn delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
            </div>
            ${elementHtml}
            <div class="settings-panel">
              ${settingsHtml}
            </div>
          </div>
        `);

  $("#formElements").append(elementDiv);

  // Initialize tooltips for this element
  elementDiv.find('[data-bs-toggle="tooltip"]').tooltip();

  // Add event handlers for the new element
  elementDiv.on("click", ".settings-btn", function (e) {
    e.stopPropagation();
    elementDiv.toggleClass("settings-open");
    saveFormToLocalStorage();
  });

  elementDiv.on("click", ".delete-btn", function (e) {
    e.stopPropagation();
    const elementName = elementDiv.find('[data-setting="name"]').val();
    const modalId = `deleteModal-${id}`;

    // Create a unique delete confirmation modal
    const deleteModal = $(`
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="${modalId}Label">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <p>Please enter the name of the form element to confirm deletion:</p>
                    <input type="text" class="form-control delete-confirm-input" placeholder="Enter element name: ${elementName}">
                    <div class="invalid-feedback">The name does not match.</div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger confirm-delete-btn">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          `);

    // Append modal to body and show it
    $("body").append(deleteModal);
    const modalInstance = new bootstrap.Modal($(`#${modalId}`)[0]);
    modalInstance.show();

    // Handle delete confirmation
    deleteModal.find(".confirm-delete-btn").on("click", function () {
      const inputName = deleteModal.find(".delete-confirm-input").val();
      if (inputName === elementName) {
        const tooltipTrigger = elementDiv.find('[data-bs-toggle="tooltip"]');
        const tooltipInstance = bootstrap.Tooltip.getInstance(
          tooltipTrigger[0]
        );
        if (tooltipInstance) {
          tooltipInstance.dispose();
        }
        elementDiv.remove();
        modalInstance.hide();
        deleteModal.remove();

        // Save to local storage after deletion
        saveFormToLocalStorage();

        $.notify("Form element deleted successfully!", "success");
        if ($("#formElements .form-element").length === 0) {
          $("#formElements").html(
            '<p class="empty-message">Your form is empty. Add elements by dragging them from the sidebar.</p>'
          );
        }
      } else {
        deleteModal.find(".delete-confirm-input").addClass("is-invalid");
        $.notify("Remove form elements failed!", "error");
      }
    });

    // Clean up modal when closed
    deleteModal.on("hidden.bs.modal", function () {
      deleteModal.remove();
    });
  });

  // Add option buttons
  elementDiv.on("click", ".add-option", function (e) {
    e.stopPropagation();
    const optionList = $(this).prev(".option-list");
    const isRole = optionList.find("[data-role]").length > 0;
    const newOption = $(`
            <div class="option-item">
              <input type="text" class="setting-control" placeholder="New ${
                isRole ? "role" : "option"
              }" ${isRole ? "data-role" : "data-option"}>
              <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
            </div>
          `);
    optionList.append(newOption);

    newOption.find(".remove-option").on("click", function () {
      if (optionList.find(".option-item").length > 1) {
        $(this).closest(".option-item").remove();
        saveFormToLocalStorage();
      } else {
        $.notify("You must have at least one option.", "warn");
      }
    });

    saveFormToLocalStorage();
  });

  elementDiv.find(".remove-option").on("click", function (e) {
    e.stopPropagation();
    const optionList = $(this).closest(".option-list");
    if (optionList.find(".option-item").length > 1) {
      $(this).closest(".option-item").remove();
      saveFormToLocalStorage();
    } else {
      $(this).closest(".option-item").find("input").val("");
      $(this).closest(".option-item").find("input").removeClass("is-invalid");
      $.notify("You must have at least one option.", "warn");
    }
  });

  // Real-time validation for email and password
  elementDiv.on("input", ".field-control", function () {
    const input = $(this);
    if (input.attr("type") === "email" || input.attr("type") === "password") {
      input.toggleClass("is-invalid", !input[0].checkValidity());
    }
  });

  // Password show/hide toggle
  elementDiv.on("click", ".toggle-password", function () {
    const input = $(this).closest(".input-group").find(".field-control");
    const icon = $(this).find("i");
    if (input.attr("type") === "password") {
      input.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      input.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });

  // File upload button click to trigger file input
  elementDiv.on("click", ".file-upload-btn", function () {
    $(this).siblings('input[type="file"]').trigger("click");
  });

  // Update file name display when a file is selected
  elementDiv.on("change", 'input[type="file"]', function () {
    const fileInput = $(this);
    const fileNameSpan = fileInput.siblings(".file-name");
    const files = fileInput[0].files;
    if (files.length > 0) {
      fileNameSpan.text(
        files.length === 1 ? files[0].name : `${files.length} files selected`
      );
    } else {
      fileNameSpan.text("");
    }
  });

  // Update preview on settings change
  elementDiv.on("change input", "[data-setting]", function (e) {
    e.stopPropagation();
    updatePreview(elementDiv);
    saveFormToLocalStorage();
  });

  // Apply saved data if it exists
  if (savedData) {
    // Apply settings
    Object.entries(savedData.settings).forEach(([setting, value]) => {
      const input = elementDiv.find(`[data-setting="${setting}"]`);
      if (input.length) {
        if (input.is(":checkbox")) {
          input.prop("checked", value);
        } else {
          input.val(value);
        }
      }
    });

    // Apply options
    if (savedData.options.length > 0) {
      const optionList = elementDiv.find(".option-list");
      if (optionList.length) {
        optionList.empty();
        savedData.options.forEach((option, index) => {
          const newOption = $(`
                  <div class="option-item">
                    <input type="text" class="setting-control" value="${option}" data-option>
                    <span class="remove-option"><i class="bi bi-x-circle-fill"></i></span>
                  </div>
                `);
          optionList.append(newOption);
        });
      }
    }

    // Update the preview immediately
    updatePreview(elementDiv);
  }
}

$(document).ready(function () {
  // Load saved form when page loads
  loadFormFromLocalStorage();

  let draggedItem = null;

  // Initialize tooltips
  $('[data-bs-toggle="tooltip"]').tooltip();

  // Tab switching functionality
  $(".nav-items div").click(function () {
    // Remove active class from all tabs
    $(".nav-items div").removeClass("active");

    // Add active class to clicked tab
    $(this).addClass("active");

    // Handle tab-specific actions
    if ($(this).attr("id") === "build") {
      // Show build content
      
      $(".container").show();
      $(".title-share, .container-fluid").hide();
    } else if ($(this).attr("id") === "publish") {
      // Hide build content and show publish content
      $("#container2").hide();
      $(".title-share, .container-fluid").show();
    }
  });

  // Add event listeners for drag and drop
  $(".field-item")
    .on("dragstart", function (e) {
      draggedItem = this;
      e.originalEvent.dataTransfer.setData("text/plain", $(this).data("type"));
      e.originalEvent.dataTransfer.effectAllowed = "copy";
      setTimeout(() => $(this).addClass("dragging"), 0);
    })
    .on("dragend", function () {
      $(this).removeClass("dragging");
      draggedItem = null;
    });

  $("#dropZone")
    .on("dragover", function (e) {
      e.preventDefault();
      e.originalEvent.dataTransfer.dropEffect = "copy";
      $(this).addClass("highlight");
    })
    .on("dragleave", function () {
      $(this).removeClass("highlight");
    })
    .on("drop", function (e) {
      e.preventDefault();
      $(this).removeClass("highlight");

      if (draggedItem) {
        addFormElement($(draggedItem).data("type"));

        // Remove empty message if it exists
        const emptyMsg = $("#formElements .empty-message");
        if (emptyMsg.length) {
          emptyMsg.remove();
        }

        // Save to local storage
        saveFormToLocalStorage();
      }
    });

  // Make form elements draggable
  $("#formElements")
    .on("dragstart", ".form-element", function (e) {
      draggedItem = this;
      e.originalEvent.dataTransfer.setData("text/plain", "reorder");
      e.originalEvent.dataTransfer.effectAllowed = "move";
      setTimeout(() => $(this).addClass("dragging"), 0);
    })
    .on("dragend", ".form-element", function () {
      $(this).removeClass("dragging");
      draggedItem = null;
      saveFormToLocalStorage();
    })
    .on("dragover", function (e) {
      e.preventDefault();
      e.originalEvent.dataTransfer.dropEffect = "move";

      if (!draggedItem || !$(draggedItem).hasClass("form-element")) return;

      const afterElement = getDragAfterElement(this, e.clientY);
      if (afterElement == null) {
        $(this).append(draggedItem);
      } else {
        $(afterElement).before(draggedItem);
      }
    });

  $("#clearBtn").on("click", function () {
    if ($("#formElements .form-element").length) {
      const modalId = `clearFormModal`;

      // Create a unique clear form confirmation modal
      const clearModal = $(`
              <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="${modalId}Label">Confirm Clear Form</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <p>Are you sure you want to clear the form? This will remove all elements.</p>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                      <button type="button" class="btn btn-danger confirm-clear-btn">Yes</button>
                    </div>
                  </div>
                </div>
              </div>
            `);

      // Append modal to body and show it
      $("body").append(clearModal);
      const modalInstance = new bootstrap.Modal($(`#${modalId}`)[0]);
      modalInstance.show();

      // Handle clear confirmation
      clearModal.find(".confirm-clear-btn").on("click", function () {
        $("#formElements").html(
          '<p class="empty-message">Your form is empty. Add elements by dragging them from the sidebar.</p>'
        );
        // Clear local storage
        localStorage.removeItem("savedForm");
        modalInstance.hide();
        clearModal.remove();
        $.notify("Form cleared successfully!", "success");
      });

      // Clean up modal when closed
      clearModal.on("hidden.bs.modal", function () {
        clearModal.remove();
      });
    } else {
      $.notify("Form is already empty!", "error");
    }
  });

  $("#saveBtn").on("click", function () {
    saveFormToLocalStorage();
    $.notify("Form saved successfully!", "success");
  });

  $("#previewModal").on("show.bs.modal", function (event) {
    const previewContent = $("#previewContent");
    previewContent.html("");

    const formContainer = $("<div>").addClass("form-preview-container");
    previewContent.append(formContainer);

    const formElements = $("#formElements .form-element");
    formElements.each(function () {
      const clonedElement = $(this).clone();

      clonedElement
        .find(".element-actions, .settings-panel, .toggle-password")
        .remove();

      clonedElement.find("input, textarea, select").each(function () {
        $(this).prop("disabled", true);
        if ($(this).attr("type") === "file") $(this).val("");
      });

      clonedElement.find("button").each(function () {
        $(this).prop("disabled", false).off("click");
      });

      formContainer.append(clonedElement);
    });

    if (formElements.length === 0) {
      formContainer.html(
        '<p class="empty-message">No form elements to preview.</p>'
      );
    }
  });

  $("#saveSettingsBtn").on("click", function () {
    alert("✅ Settings have been saved successfully.");

    $("#shareModal").modal("hide");
  });

  $("#passwordProtect").change(function () {
    if ($(this).is(":checked")) {
      $("#passwordSection").show();
    } else {
      $("#passwordSection").hide();
    }
  });

  window.selectAccess = function (accessType) {
    $(".option-item").removeClass("active");
    $(`#access-${accessType}`).addClass("active");

    $(".option-check i").removeClass("text-success").addClass("text-muted");
    $(`#access-${accessType} .option-check i`)
      .removeClass("text-muted")
      .addClass("text-success");
  };

  $("#quick-share").click(function () {
    $("#shareModal").modal("show");
  });

  $("#pdf-download").click(function () {
    $("#pdfModal").modal("show");
  });
});
