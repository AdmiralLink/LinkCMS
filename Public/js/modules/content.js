class Content {
    constructor(options) {
        let defaults = {
            apiEndpoint: '/api/pages/save',
            contentName: 'Page',
            editEndpoint: '/manage/pages/edit/'
        };
        if (options) {
            for (let [key, value] of Object.entries(defaults)) {
                if (options[key]) {
                    this[key] = options[key];
                } else {
                    this[key] = value;
                }
            }
        }
        this.Slug = {
            checking: false,
            valid: false
        };
        this.ErrorClass = 'b-3 b-solid b-color-warning';
        this.Buttons = {
            datePicker: document.getElementById('datePicker'),
            //revert: document.getElementById('revertBtn'),
            draft: document.getElementById('draftBtn'),
            preview: document.getElementById('previewBtn'),
            publish: document.getElementById('publishBtn'),
            view: document.getElementById('viewBtn'),
            //review: document.getElementById('reviewBtn'),
        };   
        this.Actions = {
            saving: false,
            type: false
        };
        this.Data  = {
            id: null,
            title: null,
            slug: null,
            status: null,
            template: null,
            pubDate: null,
            draftModifiedDate: null,
            draftContent: null,
            publishedModifiedDate: null,
            publishedContent: null
        };
        this.Editor = false;
        this.Elements = {};
    }

    addEvents() {
        let self = this;
        this.Buttons.datePicker.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            let modal = new DatePickerModal(self.Data.pubDate);
            modal.modalContainer.addEventListener('confirmed', function(e) {
                self.Elements.pubDate.value = modal.picker.time.string;
                self.Elements.pubDate.focus();
                self.Data.pubDate = modal.picker.time.timestamp;
            });
            modal.modalContainer.addEventListener('canceled', function(e) {
                self.Elements.pubDate.focus();
            });
        });
        /*this.Buttons.revert.addEventListener('click', function(e) {
            e.preventDefault();
            let modal = new MiniModal({
                confirm: true,
                content: 'This will replace your content with the currently published content. All changes will be lost. Are you sure you want to do this?'
            });
            modal.addEventListener('confirmed', function(e) {
                this.revertContent();
            });
        });*/
        this.Buttons.draft.addEventListener('click', function(e) {
            e.preventDefault();
            self.save('draft');
        });
        this.Buttons.preview.addEventListener('click', function(e) {
            e.preventDefault();
            self.Buttons.draft.click();
            window.open(window.location.href.replace('edit', 'preview'), '_blank');
        });
        this.Buttons.publish.addEventListener('click', function(e) {
            e.preventDefault();
            self.save('publish');
        });
        this.Buttons.view.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(window.linkcms.url + '/' + self.Data.slug, '_blank');
        });
        /*this.Buttons.review.addEventListener('click', function(e) {
            e.preventDefault();
        });*/
    }

    afterCheck() {
        this.Data.draftModifiedDate = dayjs().unix();
        if (this.Actions.type == 'publish') {
            this.Data.publishedContent = this.Data.draftContent; 
            this.Data.publishedModifiedDate = this.Data.draftModifiedDate;
        }
        this.setStatus();
        this.localSave();
        this.sendData();
    }

    checkRequired() {
        let stop = false;
        if (this.Elements.title.value) {
            this.Elements.title.className = '';
            this.Elements.slug.className = '';
            if (!this.Elements.slug.value) {
                this.Elements.slug.value = slugify(this.Elements.title.value);
            } else {
                this.Elements.slug.value = slugify(this.Elements.slug.value);
            }
            this.checkSlug();
        } else {
            this.Elements.title.className = this.ErrorClass;
            stop = true;
            if (!this.Elements.slug.value) {
                this.Elements.slug.className = this.ErrorClass;
            } else {
                this.Elements.slug.value = slugify(this.Elements.slug.value);
                this.checkSlug();
            }
        }
        if (this.Actions.type == 'publish') {
            if (!this.Elements.pubDate.value) {
                this.Elements.pubDate.value = dayjs().format('MMM. DD YYYY h:mm a');
                this.Data.pubDate = dayjs().unix();
            } else {
                this.Data.pubDate = dayjs(new Date(this.Elements.pubDate.value)).unix();
            }
        }
        return !stop;
    }

    checkSlug() {
        let slug = this.Elements.slug.value;
        if (!slug) {
            this.Slug.valid = false;
            this.Elements.slug.className = this.ErrorClass;
            this.Elements.slugAlert.innerText = 'Missing slug';
        }
        let ajax = new Ajax('/api/content/slugTaken/' + slug + '/' + this.Data.id, false, false, 'GET');
        this.Slug.checking = true;
        let self = this;
        let checkSuccess = ajax.addEventListener('success', function(e) {
            ajax.removeEventListener('success', checkSuccess);
            if (ajax.getAttribute('content') == 'true') {
                self.Slug.valid = false;
                self.Elements.slug.className = self.ErrorClass;
                self.Elements.slugAlert.innerText = 'The slug "' + self.Elements.slug.value + '" is already in use on this site. Please try another.';
            } else {
                self.Elements.slug.className = '';
                self.Data.slug = self.Elements.slug.value;
                self.Slug.valid = true;
            }
            self.Slug.checking = false;
            document.body.dispatchEvent(new Event('Slug checked'));
        });
        let checkFailure = ajax.addEventListener('failure', function(e) {
            ajax.removeEventListener('failure', checkFailure);
            self.Slug.checking = false;
            document.body.dispatchEvent(new Event('Slug checked'));
        });
    }

    getContent() {
        this.Data.draftContent = this.Editor.getContents();
        this.Data.title = this.Elements.title.value;
        this.Data.slug = this.Elements.slug.value;
        this.Data.template = this.Elements.template.value;
        this.Data.excerpt = this.Elements.excerpt.value;
    }

    getElements() {
        let self = this;
        ['pubDate', 'slug', 'title', 'slugAlert', 'template', 'excerpt'].forEach(function(elId) {
            self.Elements[elId] = document.getElementById(elId);
        });
    }

    importData(data) {
        let skip = ['id', 'status', 'draftContent', 'draftModifiedDate', 'publishedContent', 'publishedModifiedDate'];
        for (let [key,value] of Object.entries(data)) {
            if (key == 'type' || !value)
                continue;
            this.Data[key] = value;
            if (skip.indexOf(key) > -1)
                continue;
            if (key == 'pubDate') {
                value = dayjs(new Date(value * 1000)).format('MMM. DD YYYY h:mm a');
            }
            this.Elements[key].value = value;
        };      
    }

    init() {
        this.getElements();
        this.addEvents();
    }

    localSave() {}

    receiveData(contentObj, evt, type, ajax, modal) {
        contentObj.Actions.saving = false;
        if (type == 'success') {
            if (ajax.response.content.type == 'insert') {
                window.location.href = contentObj.editEndpoint + ajax.response.content.id;
            } else {
                contentObj.setControls();
                modal.text.innerText = contentObj.contentName + ' saved';
                modal.notification.innerText = contentObj.contentName + ' saved successfully. Hit escape to close the modal';
                let icon = modal.modalContent.querySelectorAll('i')[0].classList;
                icon.remove('fa-hourglass');
                icon.add('fa-check-circle');
                icon.remove('fa-spin');
                icon.add('t-color-success')
                modal.addConfirmButton();
                modal.addCloseX();
                modal.confirmBtn.focus();
            }
        } else {
            modal.close();
        }
    }
    
    revertContent() {
        this.Data.draftContent = this.Data.publishedContent;
        this.Editor.removeAllBlocks(this.Data.draftContent);
    }

    save(type) {
        this.Actions.type = type;
        this.getContent()
        let self = this;
        if (this.checkRequired()) {
            if (!this.Slug.checking) {
                this.afterCheck();
            } else {
                let Listener = document.body.addEventListener('Slug checked', function() {
                    document.body.removeEventListener('Slug checked', Listener);
                    if (self.Slug.valid) {
                        self.afterCheck();
                    }
                });
            }
        }
    }

    sendData() {
        if (this.Actions.saving) {
            return false;
        }
        this.Actions.saving = true;
        let contentObj = this;
        let modal = new WorkingModal('Saving, please wait ...');
        var ajaxSend = new Ajax(this.apiEndpoint, this.Data, false, 'POST', true);
        ajaxSend.eventEl.addEventListener('success', this.receiveData.bind(null, contentObj, event, 'success', ajaxSend, modal));
        ajaxSend.eventEl.addEventListener('failure', this.receiveData.bind(null, contentObj, event, 'success', ajaxSend, modal));
    }

    setControls(state) {
        let disabled = [];
        switch(state) {
            case 'insert':
                // disabled = ['revert', 'view', 'review'];
                disabled = ['view', 'review'];
                break;
            case 'edit':
            default:
                if (this.Data.status == 'draft') {
                    // disabled = ['revert', 'view', 'review'];
                    disabled = ['view', 'review'];
                } else {
                    disabled = [];
                }
                break;
        }
        for (let [key,value] of Object.entries(this.Buttons)) {
            if (disabled.indexOf(key) > -1) {
                value.setAttribute('disabled', true);
            } else {
                value.removeAttribute('disabled');
            }
        }
    }

    setStatus() {
        if (this.Actions.type == 'publish' || this.Data.publishedModifiedDate) {
            if (this.Data.pubDate <= dayjs().unix()) {
                this.Data.status = 'published';
            } else {
                this.Data.status = 'scheduled';
            }
        } else {
            this.Data.status = 'draft';
        }
    }

    start(data) {
        this.init();
        if (data) {
            this.importData(data);
            data = this.Data.draftContent;
            this.setControls('edit');
        } else {
            this.setControls('insert');
        }
        this.Editor = Hat.start({imageUploadUrl: '/api/image/upload', data: data});
        window.data = this.Data;
    }
}