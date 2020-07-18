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
                                console.log('falsified');
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
                    let upload = new Ajax(url, data, bar);
                    window.upload = upload;
                    upload.addEventListener('success', function(e) {
                        bar.track.classList.add('success');
                        uploader.createImageEl(e.target.getAttribute('imageUrl'),e.target.getAttribute('altText'));
                        uploader.form.dispatchEvent(new Event('uploaded'));
                        bar.track.remove();
                        uploader.uploading = false;
                    });
                    upload.addEventListener('failure', function(e) {
                        if (uploader.uploading) {  
                            uploader.uploading = false;
                            bar.track.classList.add('failure');
                            bar.track.remove();
                            uploader.form.style.display = 'block';
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
        this.preview = new DomEl('img.preview'); 
        this.label.append(icon);
        this.label.append(this.preview);
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

    createImageEl(url, altText) {
        this.imageEl = new DomEl('img[src=' + url + '][alt=' + altText + '].chosen');
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
