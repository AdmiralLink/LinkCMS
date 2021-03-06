class MiniModal {
    constructor(content, childClass=false) {
        this.confirmed = false;
        if (!childClass) {
            return this.constructModal(content);
        }
    }

    addClickHandlers() {
        let modal = this;
        if (this.options.closeOnBackgroundClick) {
            this.backgroundDiv.addEventListener('click', function(e) {
                e.preventDefault();
                modal.close();
            });
        }
        this.modalContainer.addEventListener('keydown', function(e) {
            let option = this.options;
            if (e.keyCode == 13) {
                e.preventDefault();
                if (modal.options.enterConfirms) {
                    modal.confirm();
                }
            }
        });
    }

    addCloseX() {
        this.closeBtn = new DomButton('Close modal', 'times-circle', 'closeBtn');
        this.header.append(this.closeBtn);
        let modal = this;
        this.closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.close();
        });
    }

    addConfirmButton() {
        let modal = this;
        if (!this.buttonBar) {
            this.buttonBar = new DomEl('div.modal-buttons');
        }
        this.confirmBtn = new DomButton(this.options.confirmButtonTitle, false, this.options.confirmButtonClass, this.options.confirmButtonText);
        this.buttonBar.append(this.confirmBtn);
        this.modalContainer.append(this.buttonBar);
        if (this.options.confirm) {
            this.cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                modal.close();        
            });
        }
        this.confirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.confirm();
        });
    }

    addKeyboardHandlers() {
        let modal = this;
        this.modalContainer.addEventListener('keydown', function(e) {
            if (e.which == 27) {
                e.preventDefault();
                e.stopPropagation();
                modal.close();
            }
        });
    }

    buildOptions(content) {
        this.getDefaultOptions();
        if (typeof(content) == 'string') {
            this.options.content = content;
        } else {
            for (let [key,value] of Object.entries(content)) {
                this.options[key] = value;
            }
        }
    }

    buildModal() {
        if (this.options.modalClass) {
            if (typeof(this.options.modalClass) == 'string') {
                this.options.modalClass = [this.options.modalClass];
            }
            this.options.modalClass.forEach(function(className) {
                this.backgroundDiv.classList.add(className);
                this.modalContainer.classList.add(className);
            });
        }
        this.header = new DomEl('div.modal-header');
        if (this.options.header) {
            let h2 = new DomEl('h2');
            h2.text = this.options.header;
            this.header.append(h2);
        }
        if (this.options.closeX) {
            this.addCloseX();
        }
        this.modalContainer.append(this.header);
        this.modalContent = new DomEl('div.modal-content[tab-index=0]');
        if (this.options.notificationText) {
            this.notification.innerText = this.options.notificationText;
        }
        if (this.options.contentType == 'text') {
            this.modalContent.innerText = this.options.content;
            if (!this.options.notificationText) {
                this.notification.innerText = this.options.content;
            }
        } else if (this.options.contentType == 'node') {
            this.modalContent.append(this.options.content);
        } else {
            this.modalContent.innerHTML = this.options.content;
        }
        if (this.options.notificationTarget) {
            this.modalContainer.setAttribute('aria-describedby', this.options.notificationTarget);
        }
        this.modalContainer.append(this.modalContent);
        if (!this.options.noButtons) {
            this.buttonBar = new DomEl('div.modal-buttons');
            if (this.options.confirm) {
                this.cancelBtn = new DomButton(this.options.cancelButtonTitle, false, this.options.cancelButtonClass, this.options.cancelButtonText);
                this.buttonBar.append(this.cancelBtn);
            } else {
                this.buttonBar.style.textAlign = 'center';
            }
            this.addConfirmButton();
        }
    }

    buildBasicStructure() {
        let theTime = new Date().getMilliseconds();
        this.notification = new DomEl('label.sr-only[aria-live="alert"]#alertModalNotifier' + theTime);
        this.backgroundDiv = new DomEl('div.miniModal-background');
        this.modalContainer = new DomEl('div.miniModal-container[aria-modal="true"]');
    }

    close() {
        if (this.options.confirm && !this.confirmed) {
            this.modalContainer.dispatchEvent(new Event('canceled'));
        } else {
            this.modalContainer.dispatchEvent(new Event('closed'));
        }
        this.backgroundDiv.classList.remove('show');
        this.modalContainer.classList.remove('show');
        let modal = this;
        setTimeout(function() {
            modal.backgroundDiv.remove();
            modal.modalContainer.remove();
        }, 750);
    }

    confirm() {
        if (this.options.confirm) {
            this.modalContainer.dispatchEvent(new Event('confirmed'));
            this.confirmed = true;
        }
        this.close();
    }

    constructModal(content) {
        this.buildBasicStructure();
        this.buildOptions(content);
        this.buildModal();
        this.addClickHandlers();
        this.addKeyboardHandlers();
        this.show();
        if (this.options.returnObject) {
            return this;
        } else {
            return this.modalContainer;
        }
    }

    getDefaultOptions() {
        this.options = {
            cancelButtonClass: 'btnCancel',
            cancelButtonText: 'Cancel',
            cancelButtonTitle: 'Cancel action',
            confirmButtonClass: 'btnConfirm',
            confirmButtonText: 'OK',
            confirmButtonTitle: 'Proceed with action',
            closeOnBackgroundClick: true,
            closeX: true,
            confirm: false,
            content: false,
            contentType: 'text',
            enterConfirms: true,
            focusTarget: false,
            header: false,
            modalClass: false,
            noButtons: false,
            notificationTarget: this.notification.id,
            notificationText: false,
            returnObject: false
        };
    }

    show() {
        document.body.append(this.backgroundDiv);
        document.body.append(this.modalContainer);
        this.backgroundDiv.classList.add('show');
        this.modalContainer.classList.add('show');
        let target = this.confirmBtn; 
        if (this.options.focusTarget) {
            if (typeof(this.options.focusTarget) == 'string') {
                target = this[this.options.focusTarget];
            } else {
                target = this.options.focusTarget;
            }   
        } else if (this.options.confirm) {
            target = this.cancelBtn;
        }
        setTimeout(function() {
            target.focus();
        },0);
    }
}

class ErrorModal extends MiniModal {
    constructor(errorMessage) {
        let errorDiv = new DomEl('div.error');
        errorDiv.append(new DomEl('i.fas.fa-exclamation-circle.fa-2x'));
        errorDiv.append(new DomEl('br'));
        errorDiv.append(new DomEl('p').innerText = errorMessage);
        super({
            closeX: false,
            confirmButtonClass: false,
            contentType: 'node',
            content: errorDiv,
            focusTarget: errorDiv,
            header: 'Error',
            notificationText: errorMessage
        });
    }
}

class WorkingModal extends MiniModal {
    constructor(message) {
        let div = new DomEl('div.t-center');
        div.append(new DomEl('i.fas.fa-hourglass.fa-spin.fa-2x'));
        div.append(new DomEl('br'));
        let text = new DomEl('p');
        text.innerText = message
        div.append(text);
        super({
            closeX: false,
            closeOnBackgroundClick: false,
            confirmButtonClass: false,
            contentType: 'node',
            content: div,
            focusTarget: div,
            header: 'Please wait',
            noButtons: true,
            returnObject: true,
            notificationText: message
        });
        this.text = text;
    }
}

class ImageLibraryModal extends MiniModal {
    constructor() {
        super(false, true);
        this.library = new ImageLibrary();
        this.constructModal(this.getModalOptions()); 
        this.modalContainer.classList.add('imageLibrary');
    }

    confirm() {
        if (this.options.confirm) {
            this.modalContainer.dispatchEvent(new Event('confirmed'));
            this.confirmed = true;
        }
        this.close();
    }

    getModalOptions() {
        return {
            contentType: 'node',
            content: this.library.container,
            confirm: true,
            enterConfirms: true,
            focusTarget: this.library.addButton,
        };
    }
}

class ImageUploadModal extends MiniModal {
    constructor() {
        super(false, true);
        this.uploader = new ImageUploader;
        this.addEvents();
        this.constructModal(this.getModalOptions());
    }

    addEvents() {
        let modal = this;
        let uploader = this.uploader;
        this.uploader.form.addEventListener('uploaded', function(e) {
            modal.modalContainer.dispatchEvent(new Event('uploaded'));
            modal.close();
        });
        this.uploader.form.addEventListener('keydown', function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                uploader.confirm();
            }
        });
        this.uploader.input.addEventListener('change', function(e) {
            uploader.acceptFile(this.files[0]);
        });
        this.uploader.label.addEventListener('drop', function(e) {
            uploader.acceptFile(e.dataTransfer.files[0]);
        });
    }

    confirm() {
        this.uploader.confirm();
    }

    getModalOptions() {
        return {
            contentType: 'node',
            content: this.uploader.container,
            confirm: true,
            enterConfirms: false,
            focusTarget: this.uploader.label,
        };
    }
}