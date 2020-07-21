class DomEl { 
    constructor(creationString) {
        this.elType = creationString.match(/^(\w+)*/g);
        this.classes = creationString.match(/\.(?![^[]*])([^\s\.\#\[]*)/g);
        this.id = creationString.match(/\#([^\s\.\[]*)/g);
        this.attributes = creationString.match(/\[([^\]]*)/g);
        if (this.elType) {
            this.el = document.createElement(this.elType);
            if (this.classes && this.classes.length > 0) {
                for (var className of this.classes) {
                    this.el.classList.add(className.replace('.',''));
                }
            }
            if (this.attributes && this.attributes.length > 0) {
                for (var attributeString of this.attributes) {
                    let attribute = attributeString.split('=');
                    if (attribute.length == 1) {
                        attribute.push('');
                    } else {
                        attribute[1] = attribute[1].replace(/"/g,'');
                    }
                    attribute[0] = attribute[0].replace('[','');
                    if (['title','href'].indexOf(attribute[0]) > -1) {
                        this.el[attribute[0]] = attribute[1];
                    }
                    this.el.setAttribute(attribute[0],attribute[1]);
                }
            }
            if (this.id && this.id.length == 1) {
                this.el.id = this.id[0].replace('#','');
            }
            return this.el;
        }   
    }
}

class DomButton { 
    constructor(title, icon, btnClass, text) {
        let btn = (btnClass) ? 'button.' + btnClass : 'button';
        let buttonEl = new DomEl(btn + '[title="' + title + '"]');
        if (icon) {
            buttonEl.append(new DomEl('i.fas.fa-' + icon));
        }
        if (text) {
            let span = new DomEl('span');
            span.innerText = text;
            buttonEl.append(span);
        }
        return buttonEl
    }
}

class Checkbox {
    constructor(name, labelDisplay, altTextOff, altTextChecked, value) {
        let checked = (value) ? '[checked]' : '';
        let id = name + new Date().getMilliseconds();
        this.box = new DomEl('input[type=checkbox][id=' + id + '][name=' + name + ']' + checked);
        this.label = new DomEl('label[for=' + id + '][tabindex=0][describedby=Description' + name +'].checkbox');
        let notification = new DomEl('div.sr-only[tab-index=0][aria-hidden=true][aria-live=assertive][aria-atomic=additions]#Description' + name);
        notification.innerText = (value) ? altTextChecked : altTextOff; 
        this.label.addEventListener('keydown', function(e) {
            if (e.keyCode == 32) {
                this.label.children[0].click();
                notification.innerText = (this.label.children[0].checked) ? altTextChecked : altTextOff;
            }
        });
        this.checkOff = new DomEl('span.fas.fa-circle');
        this.checkOn = new DomEl('span.fas.fa-check-circle');
        this.text = new DomEl('span');
        this.text.innerText = labelDisplay;
        this.label.append(this.box);
        this.label.append(this.checkOff);
        this.label.append(this.checkOn);
        this.label.append(this.text);
        return this.label;
    }
}

class InputField {
    constructor(id, labelName, placeholder, type, value) {
        type = type || 'text';
        value = value || '';
        let nodeId = id + new Date().getMilliseconds();
        let inputString = 'input#' + nodeId + '[name="' + id + '"][type="'+ type + '"]';
        if (placeholder) {
            inputString += '[placeholder="' + placeholder + '"]';
        }
        let input = new DomEl(inputString);
        if (value) {
            input.value = value;
        }
        let label = new DomEl('label[for="' + nodeId + '"]');
        label.innerText = labelName;
        label.append(input);
        return label; 
    }
}