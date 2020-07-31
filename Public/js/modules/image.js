class ImageLibrary {
    constructor() {
        this.selectedImage = false;
        this.hasMore = false;
        if (!window.linkcmsImages) {
            window.linkcmsImages = {
                images: [],
                imageIds: [],
                offset: 0,
                total: false
            };
        }
        this.imageStore = window.linkcmsImages;
        this.buildElements();
        this.loadFromLocal();
        this.loadImages();
        this.addEvents();

    }

    acceptUpload(e) {
        if (this.uploadModal.uploader.uploadData && this.uploadModal.uploader.uploadData.type == 'success') {
            let data = this.uploadModal.uploader.uploadData;
            let image = new Image(data.content.image, this, true);
            this.imageStore.imageIds.push(image.id);
            this.imageStore.images.push(image);
            this.selectImage(image.imageButton);
            this.uploadModal = false;
        } else {
            this.uploadModal = false;
        }
    }

    addEvents() {
        let library = this;        
        this.addButton.addEventListener('click', function(e) {
            e.preventDefault();
            library.uploadModal = new ImageUploadModal();
            library.uploadModal.modalContainer.addEventListener('uploaded', library.acceptUpload.bind(library));
        });
        this.loadButton.addEventListener('click', function(e) {
            e.preventDefault();
            library.loadImages();
        });
    }

    addImages() {
        if (this.ajaxload.response.type == 'success') {
            if (this.ajaxload.response.content.count) {
                this.imageStore.total = parseInt(this.ajaxload.response.content.count);
            }
            if (this.ajaxload.response.content.images.length > 0) {
                this.imageStore.offset += this.ajaxload.response.content.images.length;
                let Library = this;
                this.ajaxload.response.content.images.forEach(function(imageData) {
                    let image = new Image(imageData, Library);
                    Library.imageStore.imageIds.push(image.id);
                    Library.imageStore.images.push(image);
                });
                this.ajaxload = false;
            }
        }
    }

    buildElements() { 
        this.label = new DomEl('label.sr-only');
        this.label.innerText = 'This modal will allow you to select an image from the library. Use the add button to upload a new image, or select an existing one using the spacebar to select an image and enter to confirm it.';
        this.container = new DomEl('div.library.thumbnailView');
        this.labelContainer = new DomEl('div.sr-only');
        let buttonBar = new DomEl('div.display-flex.space-between');
        this.addButton = new DomButton('addImage', 'file-upload', 'secondary stack', ' Upload');
        this.loadButton = new DomButton('loadMore', 'retweet', 'primary inverse stack', 'Load More');
        this.loadButton.setAttribute('disabled','');
        buttonBar.append(this.addButton);
        buttonBar.append(this.loadButton);
        this.imageHolder = new DomEl('div.images.display-flex');
        this.container.append(this.labelContainer);
        this.container.append(this.label);
        this.container.append(buttonBar);
        this.container.append(this.imageHolder);
    }

    checkForMore() {
        if (this.imageStore.total !== 0 && this.imageStore.total !== this.imageStore.images.length) {
            this.loadButton.removeAttribute('disabled');
        } else {
            this.loadButton.setAttribute('disabled', '');
        }
    }

    loadFromLocal() {
        if (this.imageStore.images.length > 0) {
            this.localLoad = true;
            let Library = this;
            this.imageStore.images.forEach(function(image) {
                image.buildElement(Library);
            });
        }
    }

    loadImages() {
        if (!this.imageStore.total || this.imageStore.images.length != this.imageStore.total) {
            let url ='/api/image/load/' + this.imageStore.offset;
            this.ajaxload = new Ajax(url, false, false, 'GET', true);
            let LibraryObj = this;
            this.ajaxload.eventEl.addEventListener('success', function() {
                LibraryObj.addImages();
                LibraryObj.checkForMore();
            }); 
        }
    }

    selectImage(imageButton) {
        if (imageButton.classList.contains('selected')) {
            imageButton.classList.remove('selected');
            this.selectedImage = false;
        } else {
            let extant = this.imageHolder.querySelectorAll('.selected');
            if (extant.length > 0) {
                extant[0].classList.remove('selected');
            }
            this.selectedImage = imageButton;
            this.selectedImage.classList.add('selected');
        }
    }
}

class ImageUploader {
    constructor() {
        this.required = ['altText','title'];
        this.uploading = false;
        this.fields = {};
        this.createElements();
        this.addEvents();
    }

    acceptFile(file) {
        if (file) {
            if (!file.type.match(/image.*/)) {
                new ErrorModal('File is not a valid image');
            } else {    
                this.preview.src = window.URL.createObjectURL(file);
                this.fileData = file;
                if (!this.label.classList.contains('previewing')) {
                    this.label.classList.add('previewing');
                }
            }
        }
    }

    addEvents() {
        let label = this.label;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
            label.addEventListener(eventName, function(e){e.preventDefault(); e.stopPropagation();}, false );
        });
        ['dragenter','dragover'].forEach(function(eventName) {
            label.addEventListener(eventName, function(e){ label.classList.add('hovered');});
        });
        ['dragleave','drop'].forEach(function(eventName) {
            label.addEventListener(eventName, function(e) { label.classList.remove('hovered');});
        });
        label.addEventListener('keydown', function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                e.stopPropagation();
                this.click();
            }
        });
    }   

    confirm() {
        if (!this.uploading) {
            this.uploading = true;
            if (Hat.getOption('imageUploadUrl')) {
                let url = Hat.getOption('imageUploadUrl');
                if (this.fileData) {
                    if (this.required) {
                        let hasAllFields = true;
                        let uploader = this;
                        this.required.forEach(function(requiredId) {
                            if (!uploader.fields[requiredId].value) {
                                hasAllFields = false;
                            }
                        });
                        if (!hasAllFields) {
                            new ErrorModal('Please include an image, title and alt text');
                            this.uploading = false;
                            return false;
                        }
                    }
                    let uploader = this;
                    let data = new FormData();
                    data.append('image', this.fileData);
                    this.required.forEach(function(item) {
                        data.append(item, uploader.fields[item].value);
                    });
                    if (this.fields.caption.value) {
                        data.append('caption', this.fields.caption.value);
                    }
                    if (this.fields.imageCredit.value) {
                        data.append('imageCredit', this.fields.imageCredit.value);
                    }
                    this.form.style.display = 'none';
                    let bar = new ProgressBar(this.container);
                    this.upload = new Ajax(url, data, bar, 'POST', true);
                    this.upload.eventEl.addEventListener('success', function(e) {
                        bar.track.classList.add('success');
                        uploader.uploadData = uploader.upload.response;
                        uploader.form.dispatchEvent(new Event('uploaded'));
                        bar.track.remove();
                        uploader.uploading = false;
                        uploader.upload = false;
                    });
                    this.upload.eventEl.addEventListener('failure', function(e) {
                        if (uploader.uploading) {  
                            uploader.uploading = false;
                            bar.track.classList.add('failure');
                            bar.track.remove();
                            uploader.form.style.display = 'block';
                            uploader.upload = false;
                        }
                    });
                } else {
                    new ErrorModal('No image to upload');
                    this.uploading = false;
                }
            } else {
                new ErrorModal('Upload URL is not set');
                this.uploading = false;
            }
        }
    }

    createElements() {
        this.fileData = false;
        this.container = new DomEl('div');
        this.form = new DomEl('div.imageUploadContainer');
        this.input = new DomEl('input[type=file][tabindex=-1][name="uploader"]#uploader');
        let span = new DomEl('span');
        span.innerText = 'Click here to browse or drop the image you want to upload';
        let icon = new DomEl('i.fas.fa-file-image');
        this.label = new DomEl('label.imageUploader[for="uploader"][tabindex=0][title="Hit enter to browse for an image to upload"]');
        let previewDiv = new DomEl('div.preview');
        this.preview = new DomEl('img.preview');
        previewDiv.append(this.preview); 
        this.label.append(icon);
        this.label.append(previewDiv);
        this.label.append(document.createElement('br'));
        this.label.append(span);
        this.label.append(this.input);
        this.form.append(this.label);
        let titleLabel = new InputField('title', 'Image Title');
        let captionLabel = new InputField('caption', 'Caption');
        let creditLabel = new InputField('credit', 'Image Credit');
        let altLabel = new InputField('altText','Alternative text for accessibility','A description of the photo');
        this.form.append(titleLabel);
        this.form.append(altLabel);
        this.form.append(creditLabel);
        this.form.append(captionLabel);
        this.container.append(this.form);
        this.fields.altText = altLabel.children[0];
        this.fields.title = titleLabel.children[0];
        this.fields.imageCredit = creditLabel.children[0];
        this.fields.caption = captionLabel.children[0];
    }

    setContent(content) {
        if (content.image) {
            this.input.value = content.image;
            this.createImageEl(content.image, content.altText);
            this.preview.src = content.image;
            this.preview.classList.add('previewing');
        }
        if (content.altText) {
            this.fields.altText.value = content.altText;
        }
    }
}

class Image {
    constructor(imageData, library, addToTop=false) {
        for (let [key,value] of Object.entries(imageData)) {
            this[key] = value;
        }
        this.buildElement(library, addToTop);
    }
    
    addEventListeners() {
        let library = this.library;
        this.imageButton.addEventListener('click', function(e) {
            e.preventDefault(); 
            library.selectImage(this);
        });
    }
    
    addToLibrary(addToTop) {
        if (addToTop) {
            this.library.imageHolder.insertBefore(this.imageButton, this.library.imageHolder.querySelectorAll('button')[0]);
        } else {
            this.library.imageHolder.append(this.imageButton);
        }
        this.library.labelContainer.append(this.label);
    }
    
    buildElement(library, addToTop) {
        this.library = library;
        let labelId = 'image' + new Date().getMilliseconds();
        this.label = new DomEl('label.sr-only#' + labelId);
        this.label.innerText = 'Image title: "' + this.title + '". Image description: ' + this.altText;
        let container = new DomEl('div.imageContainer');
        let imageObj = new DomEl('img[src=' + this.imageUrl + ']');
        let title = new DomEl('h3');
        title.innerText = this.title;
        this.imageButton = new DomEl('button.image.box.p-4[aria-describedby="' + labelId +']');
        for (let [key,value] of Object.entries(this)) {
            this.imageButton.dataset[key] = value;
        };
        container.append(imageObj);
        this.imageButton.append(container);
        this.imageButton.append(title);
        this.addToLibrary(addToTop);
        this.addEventListeners();
    }
}