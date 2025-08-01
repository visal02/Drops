 // Tab switching
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    // Remove active class from all tabs
    document.querySelectorAll('.nav-item').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Add active to clicked tab
    this.classList.add('active');
    
    // Toggle views
    if (this.textContent === 'PUBLISH') {
      document.getElementById('publishSection').classList.remove('d-none');
      document.querySelector('.form-area').classList.add('d-none');
    } else {
      document.getElementById('publishSection').classList.add('d-none');
      document.querySelector('.form-area').classList.remove('d-none');
    }
  });
});
     $(document).ready(function() {
            let draggedItem = null;
            let elementCounter = 0;
            
            // Initialize tooltips
            $('[data-bs-toggle="tooltip"]').tooltip();
            
            // Add event listeners for drag and drop
            $('#fieldList .field-item').on('dragstart', function(e) {
                draggedItem = this;
                e.originalEvent.dataTransfer.setData('text/plain', $(this).data('type'));
                e.originalEvent.dataTransfer.effectAllowed = 'copy';
                setTimeout(() => $(this).addClass('dragging'), 0);
            }).on('dragend', function() {
                $(this).removeClass('dragging');
                draggedItem = null;
            });
            
            $('#dropZone').on('dragover', function(e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                $(this).addClass('highlight');
            }).on('dragleave', function() {
                $(this).removeClass('highlight');
            }).on('drop', function(e) {
                e.preventDefault();
                $(this).removeClass('highlight');
                
                if (draggedItem) {
                    addFormElement($(draggedItem).data('type'));
                    
                    // Remove empty message if it exists
                    const emptyMsg = $('#formElements .empty-message');
                    if (emptyMsg.length) {
                        emptyMsg.remove();
                    }
                }
            });

            // Make form elements draggable
            $('#formElements').on('dragstart', '.form-element', function(e) {
                draggedItem = this;
                e.originalEvent.dataTransfer.setData('text/plain', 'reorder');
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                setTimeout(() => $(this).addClass('dragging'), 0);
            }).on('dragend', '.form-element', function() {
                $(this).removeClass('dragging');
                draggedItem = null;
            }).on('dragover', function(e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';
                
                // Only handle if we're dragging a form element
                if (!draggedItem || !$(draggedItem).hasClass('form-element')) return;
                
                const afterElement = getDragAfterElement(this, e.clientY);
                if (afterElement == null) {
                    $(this).append(draggedItem);
                } else {
                    $(afterElement).before(draggedItem);
                }
            });
            
            function getDragAfterElement(container, y) {
                const draggableElements = [...$(container).find('.form-element:not(.dragging')];
                
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
            
            // Add form element to the form area
            function addFormElement(type) {
                elementCounter++;
                const id = `${type}-${Date.now()}-${elementCounter}`;
                let elementHtml = '';
                let settingsHtml = '';
                
                const commonSettings = `
                    <div class="setting-group">
                        <label class="setting-label">Label</label>
                        <input type="text" class="setting-control" value="${typeToLabel(type)}" data-setting="label">
                    </div>
                    <div class="setting-group">
                        <label class="setting-label">Name/ID</label>
                        <input type="text" class="setting-control" value="${id}" data-setting="name">
                    </div>
                    <div class="setting-group">
                        <label class="setting-label">CSS Class</label>
                        <input type="text" class="setting-control" value="" data-setting="class" placeholder="form-control">
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
                        <label class="setting-label">
                            <input type="checkbox" data-setting="required"> Required field
                        </label>
                    </div>
                `;
                
                switch(type) {
                    case 'text':
                        elementHtml = `
                            <div class="help-text-container">
                                <label class="field-label">${typeToLabel(type)}</label>
                                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                                    <button class="help-button" type="button">?</button>
                                </span>
                            </div>
                            <input type="text" class="field-control" placeholder="Enter text">
                        `;
                        break;
                        
                    case 'textarea':
                        elementHtml = `
                            <div class="help-text-container">
                                <label class="field-label">${typeToLabel(type)}</label>
                                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                                    <button class="help-button" type="button">?</button>
                                </span>
                            </div>
                            <textarea class="field-control" rows="3" placeholder="Enter text"></textarea>
                        `;
                        break;
                        
                    case 'number':
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
                        `;
                        break;
                        
                    case 'date':
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
                        `;
                        break;
                        
                    case 'checkbox-group':
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
                                        <span class="remove-option">×</span>
                                    </div>
                                    <div class="option-item">
                                        <input type="text" class="setting-control" value="Option 2" data-option>
                                        <span class="remove-option">×</span>
                                    </div>
                                </div>
                                <span class="add-option">+ Add Option</span>
                            </div>
                        `;
                        break;
                        
                    case 'radio-group':
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
                                        <span class="remove-option">×</span>
                                    </div>
                                    <div class="option-item">
                                        <input type="text" class="setting-control" value="Option 2" data-option>
                                        <span class="remove-option">×</span>
                                    </div>
                                </div>
                                <span class="add-option">+ Add Option</span>
                            </div>
                        `;
                        break;
                        
                    case 'select':
                        elementHtml = `
                            <div class="help-text-container">
                                <label class="field-label">${typeToLabel(type)}</label>
                                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                                    <button class="help-button" type="button">?</button>
                                </span>
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
                                        <span class="remove-option">×</span>
                                    </div>
                                    <div class="option-item">
                                        <input type="text" class="setting-control" value="Option 2" data-option>
                                        <span class="remove-option">×</span>
                                    </div>
                                </div>
                                <span class="add-option">+ Add Option</span>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" data-setting="multiple"> Allow multiple selections
                                </label>
                            </div>
                        `;
                        break;
                        
                    case 'button':
                        elementHtml = `
                        
                            <button type="button" class="field-control">Button</button>
                        `;
                        settingsHtml = `
                            <div class="setting-group">
                                <label class="setting-label">Button Text</label>
                                <input type="text" class="setting-control" value="Button" data-setting="buttonText">
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">Button Type</label>
                                <select class="setting-control" data-setting="buttonType">
                                    <option value="button">Button</option>
                                    <option value="submit">Submit</option>
                                    <option value="reset">Reset</option>
                                </select>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">CSS Class</label>
                                <input type="text" class="setting-control" value="" data-setting="class" placeholder="btn btn-primary">
                            </div>
                        `;
                        break;
                        
                    case 'file':
                        elementHtml = `
                            <div class="help-text-container">
                                <label class="field-label">${typeToLabel(type)}</label>
                                <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="Help text will appear here">
                                    <button class="help-button" type="button">?</button>
                                </span>
                            </div>
                            <input type="file" class="field-control">
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
                        `;
                        break;
                        
                    case 'header':
                        elementHtml = `
                            <h3>Header</h3>
                        `;
                        settingsHtml = `
                            <div class="setting-group">
                                <label class="setting-label">Header Text</label>
                                <input type="text" class="setting-control" value="Header" data-setting="headerText">
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">Header Level</label>
                                <select class="setting-control" data-setting="headerLevel">
                                    <option value="h1">H1</option>
                                    <option value="h2">H2</option>
                                    <option value="h3" selected>H3</option>
                                    <option value="h4">H4</option>
                                    <option value="h5">H5</option>
                                    <option value="h6">H6</option>
                                </select>
                            </div>
                        `;
                        break;
                        
                    case 'paragraph':
                        elementHtml = `
                            <p>Paragraph text goes here.</p>
                        `;
                        settingsHtml = `
                            <div class="setting-group">
                                <label class="setting-label">Paragraph Text</label>
                                <textarea class="setting-control" rows="3" data-setting="paragraphText">Paragraph text goes here.</textarea>
                            </div>
                        `;
                        break;
                        
                    case 'hidden':
                        elementHtml = `
                            <input type="hidden">
                        `;
                        settingsHtml = `
                            <div class="setting-group">
                                <label class="setting-label">Name</label>
                                <input type="text" class="setting-control" value="${id}" data-setting="name">
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">Value</label>
                                <input type="text" class="setting-control" data-setting="value">
                            </div>
                        `;
                        break;
                        
                    case 'autocomplete':
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
                            <div class="setting-group">
                                <label class="setting-label">Options</label>
                                <div class="option-list">
                                    <div class="option-item">
                                        <input type="text" class="setting-control" value="Option 1" data-option>
                                        <span class="remove-option">×</span>
                                    </div>
                                    <div class="option-item">
                                        <input type="text" class="setting-control" value="Option 2" data-option>
                                        <span class="remove-option">×</span>
                                    </div>
                                </div>
                                <span class="add-option">+ Add Option</span>
                            </div>
                        `;
                        break;
                }
                
                if (type !== 'button' && type !== 'header' && type !== 'paragraph' && type !== 'hidden') {
                    settingsHtml += commonSettings;
                }
                
                settingsHtml += `
                    <h3>Access Control</h3>
                    <div class="setting-group">
                        <label class="setting-label">
                            <input type="checkbox" data-setting="limitAccess"> Restrict access to specific user roles
                        </label>
                        <div class="option-list" style="margin-top: 10px;">
                            <div class="option-item">
                                <input type="text" class="setting-control" value="admin" data-role placeholder="Role name">
                                <span class="remove-option">×</span>
                            </div>
                        </div>
                        <span class="add-option">+ Add Role</span>
                    </div>
                `;
                
                const elementDiv = $(`
                    <div class="form-element" data-type="${type}" data-id="${id}" draggable="true">
                        <div class="element-actions">
                            <button class="element-btn settings-btn" title="Settings">⚙️</button>
                            <button class="element-btn delete-btn" title="Delete">🗑️</button>
                        </div>
                        ${elementHtml}
                        <div class="settings-panel">
                            ${settingsHtml}
                        </div>
                    </div>
                `);
                
                $('#formElements').append(elementDiv);
                
                // Initialize tooltips for this element
                elementDiv.find('[data-bs-toggle="tooltip"]').tooltip();
                
                // Add event handlers for the new element
                elementDiv.on('click', '.settings-btn', function(e) {
                    e.stopPropagation();
                    elementDiv.toggleClass('settings-open');
                });
                
                elementDiv.on('click', '.delete-btn', function(e) {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this element?')) {
                        elementDiv.remove();
                        // Show empty message if no elements left
                        if ($('#formElements .form-element').length === 0) {
                            $('#formElements').html('<p class="empty-message">Your form is empty. Add elements by dragging them from the sidebar.</p>');
                        }
                    }
                });
                
                // Add option buttons
                elementDiv.on('click', '.add-option', function(e) {
                    e.stopPropagation();
                    const optionList = $(this).prev('.option-list');
                    const isRole = optionList.find('[data-role]').length > 0;
                    const newOption = $(`
                        <div class="option-item">
                            <input type="text" class="setting-control" placeholder="New ${isRole ? 'role' : 'option'}" ${isRole ? 'data-role' : 'data-option'}>
                            <span class="remove-option">×</span>
                        </div>
                    `);
                    optionList.append(newOption);
                    
                    // Add remove handler for the new option
                    newOption.find('.remove-option').on('click', function() {
                        if (optionList.find('.option-item').length > 1) {
                            $(this).closest('.option-item').remove();
                        } else {
                            alert('You must have at least one option.');
                        }
                    });
                });
                
                // Add remove handlers for existing options
                elementDiv.find('.remove-option').on('click', function(e) {
                    e.stopPropagation();
                    const optionList = $(this).closest('.option-list');
                    if (optionList.find('.option-item').length > 1) {
                        $(this).closest('.option-item').remove();
                    } else {
                        alert('You must have at least one option.');
                    }
                });
                
                // Update preview when settings change
                elementDiv.on('change input', '[data-setting]', function(e) {
                    e.stopPropagation();
                    updatePreview(elementDiv);
                });

                updatePreview(elementDiv);
            }
            
            // Helper function to convert type to label
            function typeToLabel(type) {
                return type.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
            
            // Update preview when settings change
            function updatePreview(elementDiv) {
                const type = elementDiv.data('type');
                const id = elementDiv.data('id');
                const settings = {};
                
                elementDiv.find('[data-setting]').each(function() {
                    const input = $(this);
                    settings[input.data('setting')] = input.is(':checkbox') ? input.prop('checked') : input.val();
                });
                
                const options = [];
                elementDiv.find('[data-option]').each(function() {
                    options.push($(this).val());
                });
                
                // Update the preview based on settings
                switch(type) {
                    case 'text':
                    case 'textarea':
                    case 'number':
                    case 'date':
                    case 'file':
                    case 'autocomplete':
                        const label = elementDiv.find('.field-label');
                        const input = elementDiv.find('.field-control');
                        const tooltipTrigger = elementDiv.find('[data-bs-toggle="tooltip"]');
                        const helpButton = elementDiv.find('.help-button');
                        
                        if (label.length && settings.label) {
                            label.text(settings.label);
                            label.toggleClass('required-field', settings.required);
                        }
                        
                        if (input.length) {
                            if (settings.placeholder) {
                                input.attr('placeholder', settings.placeholder);
                            } else {
                                input.removeAttr('placeholder');
                            }
                            
                            input.attr('class', 'field-control' + (settings.class ? ' ' + settings.class : ''));
                            input.attr('name', settings.name || id);
                            input.attr('id', settings.name || id);
                            input.prop('required', settings.required || false);
                        }
                        
                        if (tooltipTrigger.length && settings.helpText) {
                            tooltipTrigger.attr('title', settings.helpText);
                            // Update the tooltip instance if it exists
                            const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTrigger[0]);
                            if (tooltipInstance) {
                                tooltipInstance.setContent({ '.tooltip-inner': settings.helpText });
                            } else {
                                new bootstrap.Tooltip(tooltipTrigger[0]);
                            }
                        }
                        
                        // Toggle help button visibility based on whether help text exists
                        if (helpButton.length) {
                            helpButton.css('display', settings.helpText ? 'inline-block' : 'none');
                        }
                        break;
                        
                    case 'checkbox-group':
                    case 'radio-group':
                        const groupLabel = elementDiv.find('.field-label');
                        const optionContainer = elementDiv.find(`.${type === 'checkbox-group' ? 'checkbox-options' : 'radio-options'}`);
                        const tooltipTriggerr = elementDiv.find('[data-bs-toggle="tooltip"]');
                        const helpButtonn = elementDiv.find('.help-button');
                        
                        
                        if (groupLabel.length && settings.label) {
                            groupLabel.text(settings.label);
                            groupLabel.toggleClass('required-field', settings.required);
                        }
                        
                        if (optionContainer.length) {
                            optionContainer.empty();
                            options.forEach((opt, index) => {
                                const optionId = `${settings.name || id}-option${index+1}`;
                                const optionValue = opt || `option${index+1}`;
                                optionContainer.append(`
                                    <div class="option-item">
                                        <input type="${type === 'checkbox-group' ? 'checkbox' : 'radio'}" 
                                               id="${optionId}" 
                                               name="${settings.name || id}" 
                                               value="${optionValue}"
                                               ${settings.required && type === 'radio-group' ? 'required' : ''}>
                                        <label for="${optionId}">${opt || `Option ${index+1}`}</label>
                                    </div>
                                `);
                            });
                        }

                        if (tooltipTriggerr.length && settings.helpText) {
                            tooltipTriggerr.attr('title', settings.helpText);
                            // Update the tooltip instance if it exists
                            const tooltipInstancee = bootstrap.Tooltip.getInstance(tooltipTriggerr[0]);
                            if (tooltipInstancee) {
                                tooltipInstancee.setContent({ '.tooltip-inner': settings.helpText });
                            } else {
                                new bootstrap.Tooltip(tooltipTriggerr[0]);
                            }
                        }
                        
                        // Toggle help button visibility based on whether help text exists
                        if (helpButtonn.length) {
                            helpButtonn.css('display', settings.helpText ? 'inline-block' : 'none');
                        }
                        
                        break;
                        
                    case 'select':
                        const selectLabel = elementDiv.find('.field-label');
                        const select = elementDiv.find('select');
                         const tooltipTriggerrr = elementDiv.find('[data-bs-toggle="tooltip"]');
                        const helpButtonnn = elementDiv.find('.help-button');
                        
                        if (selectLabel.length && settings.label) {
                            selectLabel.text(settings.label);
                            selectLabel.toggleClass('required-field', settings.required);
                        }
                        
                        if (select.length) {
                            select.empty();
                            options.forEach((opt, index) => {
                                select.append(`<option value="${opt || `option${index+1}`}">${opt || `Option ${index+1}`}</option>`);
                            });
                            
                            select.attr('class', 'field-control' + (settings.class ? ' ' + settings.class : ''));
                            select.attr('name', settings.name || id);
                            select.attr('id', settings.name || id);
                            select.prop('required', settings.required || false);
                            select.prop('multiple', settings.multiple || false);
                        }

                        if (tooltipTriggerrr.length && settings.helpText) {
                            tooltipTriggerrr.attr('title', settings.helpText);
                            // Update the tooltip instance if it exists
                            const tooltipInstanceee = bootstrap.Tooltip.getInstance(tooltipTriggerrr[0]);
                            if (tooltipInstanceee) {
                                tooltipInstanceee.setContent({ '.tooltip-inner': settings.helpText });
                            } else {
                                new bootstrap.Tooltip(tooltipTriggerrr[0]);
                            }
                        }
                        
                        // Toggle help button visibility based on whether help text exists
                        if (helpButtonnn.length) {
                            helpButtonnn.css('display', settings.helpText ? 'inline-block' : 'none');
                        }
                        break;
                        
                    case 'button':
                        const button = elementDiv.find('button');
                        if (button.length) {
                            button.text(settings.buttonText || 'Button');
                            button.attr('type', settings.buttonType || 'button');
                            button.attr('class', settings.class || 'field-control');
                        }
                        break;
                        
                    case 'header':
                        const headerText = elementDiv.find('h1, h2, h3, h4, h5, h6');
                        if (headerText.length) {
                            const newHeader = $(`<${settings.headerLevel || 'h3'}>`).text(settings.headerText || 'Header');
                            headerText.replaceWith(newHeader);
                        }
                        break;
                        
                    case 'paragraph':
                        const paragraph = elementDiv.find('p');
                        if (paragraph.length && settings.paragraphText) {
                            paragraph.text(settings.paragraphText);
                        }
                        break;
                }
            }
            
            // Clear form
            $('#clearBtn').on('click', function() {
                if ($('#formElements .form-element').length && confirm('Are you sure you want to clear the form? This will remove all elements.')) {
                    $('#formElements').html('<p class="empty-message">Your form is empty. Add elements by dragging them from the sidebar.</p>');
                }
            });
            
            // Preview form
            $('#previewBtn').on('click', function() {
                alert('Form preview would be shown here in a complete implementation');
            });
            
            // Save form
            $('#saveBtn').on('click', function() {
                const formData = {
                    elements: [],
                    createdAt: new Date().toISOString()
                };
                
                $('.form-element').each(function() {
                    const element = $(this);
                    const type = element.data('type');
                    const id = element.data('id');
                    const elementData = {
                        type: type,
                        id: id,
                        settings: {},
                        options: [],
                        roles: []
                    };
                    
                    element.find('[data-setting]').each(function() {
                        const input = $(this);
                        elementData.settings[input.data('setting')] = input.is(':checkbox') ? input.prop('checked') : input.val();
                    });
                    
                    element.find('[data-option]').each(function() {
                        elementData.options.push($(this).val());
                    });

                    element.find('[data-role]').each(function() {
                        elementData.roles.push($(this).val());
                    });

                    formData.elements.push(elementData);
                });
                
                console.log('Form data to save:', formData);
                alert('Form data saved to console (check developer tools)');
            });
        });
