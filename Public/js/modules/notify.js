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
        if (this.options.closeX) {
            this.closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                modal.close();
            });
        }
        if (!this.options.noButtons) {
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
        this.backgroundDiv = new DomEl('div.miniModal-background');
        this.modalContainer = new DomEl('div.miniModal-container');
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
            this.closeBtn = new DomButton('Close modal', 'times-circle', 'closeBtn');
            this.header.append(this.closeBtn);
        }
        this.modalContainer.append(this.header);
        this.modalContent = new DomEl('div.modal-content');
        if (this.options.contentType == 'text') {
            this.modalContent.innerText = this.options.content;
        } else if (this.options.contentType == 'node') {
            this.modalContent.append(this.options.content);
        } else {
            this.modalContent.innerHTML = this.options.content;
        }
        this.modalContainer.append(this.modalContent);
        if (!this.options.noButtons) {
            let buttonBar = new DomEl('div.modal-buttons');
            if (this.options.confirm) {
                this.cancelBtn = new DomButton(this.options.cancelButtonTitle, false, this.options.cancelButtonClass, this.options.cancelButtonText);
                buttonBar.append(this.cancelBtn);
            } else {
                buttonBar.style.textAlign = 'center';
            }
            this.confirmBtn = new DomButton(this.options.confirmButtonTitle, false, this.options.confirmButtonClass, this.options.confirmButtonText);
            buttonBar.append(this.confirmBtn);
            this.modalContainer.append(buttonBar);
        }
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
            returnObject: false
        };
    }

    show() {
        document.body.append(this.backgroundDiv);
        document.body.append(this.modalContainer);
        this.backgroundDiv.classList.add('show');
        this.modalContainer.classList.add('show');
        if (this.options.focusTarget) {
            this.options.focusTarget.focus();
        } else {
            this.modalContent.focus();
        }
    }
}

class ErrorModal extends MiniModal {
    constructor(errorMessage) {
        let errorDiv = new DomEl('div.error');
        errorDiv.append(new DomEl('i.fas.fa-exclamation-circle'));
        errorDiv.append(new DomEl('br'));
        errorDiv.append(new DomEl('p').innerText = errorMessage);
        super({
            closeX: false,
            confirmButtonClass: false,
            contentType: 'node',
            content: errorDiv,
            focusTarget: errorDiv,
            header: 'Error',
        });
    }
}

class WorkingModal extends MiniModal {
    constructor(message) {
        let div = new DomEl('div.t-center');
        div.append(new DomEl('i.fas.fa-hourglass.fa-spin'));
        div.append(new DomEl('br'));
        div.append(new DomEl('p').innerText = message);
        super({
            closeX: false,
            closeOnBackgroundClick: false,
            confirmButtonClass: false,
            contentType: 'node',
            content: div,
            focusTarget: div,
            header: 'Please wait',
            noButtons: true,
            returnObject: true
        });
    }
}