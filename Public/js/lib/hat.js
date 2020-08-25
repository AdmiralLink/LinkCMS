(function () {
    'use strict';

    let Editor = function (containerEl, data) {
        let Blocks = [];
        let BlockChooser = {
            choiceDiv: new DomEl('div.blockChoices'),
            create: function () {
                BlockChooser.insertAddBlockButton();
                let blockChoices = window.Hat.getBlocks();
                for (let [slug, block] of Object.entries(blockChoices)) {
                    let button = new DomButton(block.description, block.icon, 'choiceBtn', block.name);
                    button.dataset.slug = slug;
                    BlockChooser.choiceDiv.append(button);
                    let control = Interface;
                    button.addEventListener('click', function (e) {
                        e.preventDefault();
                        BlockChooser.toggle();
                        let button = e.target.closest('button');
                        control.addBlock(true, false, button.dataset.slug);
                    });
                } Elements.newBlockContainer.append(BlockChooser.choiceDiv);
            },
            insertAddBlockButton: function () {
                var button = new DomEl('button#addBlock[title=Create a new block by clicking here. You will be taken to the block type selector]');
                var icon = new DomEl('i.fas.fa-plus-square');
                button.innerHTML = icon.outerHTML + ' Add block';
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    BlockChooser.toggle(this);
                });
                Elements.newBlockContainer.append(button);
            },
            toggle: function (originButton) {
                let ChoiceDiv = BlockChooser.choiceDiv;
                if (ChoiceDiv.classList.contains('show')) {
                    ChoiceDiv.classList.remove('show');
                } else {
                    ChoiceDiv.classList.add('show');
                    setTimeout(function () {
                        ChoiceDiv.children[ChoiceDiv.children.length - 1].scrollIntoView({ behavior: 'smooth' });
                    }, 400);
                    ChoiceDiv.children[0].focus();
                }
            }
        };
        let BlockCount = 0;
        let Elements = {
            blockHolder: false,
            container: false,
            newBlockContainer: new DomEl('div#newBlockContainer')
        };
        let Events = {
            fire: function (eventName, element = Elements.blockHolder) {
                element.dispatchEvent(new Event(eventName));
            }
        };
        let Internal = {
            addEvents: function() {
                Elements.blockHolder.addEventListener('blockChanged', debounce((e) => {
                    Interface.getBlockPosition();
                }, 200));
            },
            initialize: function (containerEl, data) {
                Elements.container = containerEl;
                Elements.blockHolder = document.createElement('div');
                Elements.container.append(Elements.blockHolder);
                Elements.container.append(Elements.newBlockContainer);
                if (data) {
                    data.forEach(function (blockData) {
                        Interface.loadBlock(blockData);
                    });
                } else {
                    Interface.addBlock();
                }
                Internal.manageSorting();
                Internal.addEvents();
                Interface.getBlockPosition();
                BlockChooser.create();
                document.execCommand('defaultParagraphSeparator', false, 'p');
            },
            manageSorting: function () {
                Internal.sorting = Sortable.create(Elements.blockHolder, { animation: 150, group: 'blocks', handle: 'button.handle', draggable: '.block', onEnd: function () { Events.fire('blockChanged'); } });
                Elements.blockHolder.addEventListener('blockChanged', function () {
                    if (BlockCount == 1) {
                        Internal.sorting.option('sorting', false);
                    } else {
                        Internal.sorting.option('sorting', true);
                    }
                });
            },
            removeBlock: function (block, defaultAction = true) {
                var blockId = block.mechanic.settings.id;
                for (let [key, block] of Object.entries(Blocks)) {
                    if (block.mechanic.settings.id == blockId) {
                        block.getPosition();
                        if (defaultAction) {
                            let newFocus = (block.position.first) ? block.el.nextSibling : block.el.previousSibling;
                            Interface.getBlock(newFocus).focus();
                        }
                        block.el.remove();
                        Blocks.splice(key, 1);
                        BlockCount--;
                        if (defaultAction) {
                            Events.fire('blockChanged');
                        }
                        break;
                    }
                }
            }
        };
        let Interface = {
            addBlock: function (focus = true, position = false, type = window.Hat.getDefault(), data = false) {
                if (data && !data.settings.id) {
                    data.settings.id = 'block' + new Date().getTime();
                }
                let blockClass = window.Hat.getBlock(type);
                let block = new blockClass.class(this, data);
                if (position === false) {
                    Elements.blockHolder.appendChild(block.el);
                } else {
                    Elements.blockHolder.children[position].after(block.el);
                }
                if (focus) {
                    block.focus();
                }
                Blocks.push(block);
                BlockCount++;
                Events.fire('blockChanged');
            },
            fireEvent: function (eventName, element = Elements.blockHolder) {
                Events.fire(eventName, element);
            },
            getBlock: function(blockEl) {
                for (let [key, block] of Object.entries(Blocks)) {
                    if (blockEl == block.el) {
                        return block;
                    }
                };
            },
            getBlockContainer: function () {
                return Elements.blockHolder;
            },
            getBlockPosition: function (blockEl) {
                if (!blockEl) {
                    for (let [idx, block] of Object.entries(Blocks)) {
                        Interface.getBlockPosition(block);
                    }
                } else {
                    let blocks = Elements.blockHolder.querySelectorAll('.block');
                    let position = { count: BlockCount };
                    if (position.count == 1) {
                        position.first = true;
                        position.last = true;
                        position.number = 0;
                    } else {
                        position.first = (blocks[0] == blockEl);
                        position.last = (blocks[BlockCount - 1] == blockEl);
                        for (let [idx, checkBlock] of Object.entries(blocks)) {
                            if (checkBlock == blockEl) {
                                position.number = idx;
                            }
                        }
                    }
                    return position;
                }
            },
            getContainer: function () {
                return Elements.container;
            },
            getContents: function () {
                let content = [];
                for (let [key, value] of Object.entries(Blocks)) {
                    value.getPosition();
                    let contents = value.getContents();
                    content[value.position.number] = contents;
                }

                return content;
            },
            loadBlock: function (data) {
                let block = Interface.addBlock(false, false, data.type, data);
            },
            removeAllBlocks: function (replacementData) {
                for (let [id, block] of Object.entries(Blocks)) {
                    Internal.removeBlock(block, false);
                };
                if (replacementData) {
                    replacementData.forEach(function (blockData) {
                        Interface.loadBlock(blockData);
                    });
                } else {
                    Interface.addBlock();
                }
            },
            removeBlock: function (block, force = false) {
                if (BlockCount > 1) {
                    Internal.removeBlock(block);
                }
            },
        };
        Internal.initialize(containerEl, data);
        return Interface;
    };

    class MechanicController {
        constructor(block) {
            this.current = false;
            this.parentBlock = block;
            if (this.parentBlock.settings) {
                this.settings = this.parentBlock.settings;
                delete this.parentBlock.settings;
            } else {
                this.settings = {};
            }
            this.container = new DomEl('div.mechanicsContainer');
            this.parentBlock.el.append(this.container);
            this.mechanics = [];
            this.transition = false;
        }

        add(mechanicObj) {
            this.mechanics.push(mechanicObj.init(this));
        }

        getValues() {
            let mech = this;
            this.mechanics.forEach(function (mechanic) {
                for (let [key, value] of Object.entries(mechanic.getValues())) {
                    mech.settings[key] = value;
                }
            });
            return mech.settings;
        }

        toggleView(el, btn) {
            if (!this.transition) {
                this.transition = true;
                let mech = this;
                let current = this.current;
                if (current && current == el) {
                    let remove = current;
                    current.dispatchEvent(new Event('close'));
                    this.current = false;
                    this.container.style.maxHeight = '0px';
                    this.parentBlock.el.style.marginBottom = '0px';
                    this.parentBlock.el.classList.remove('showMechanics');
                    this.parentBlock.settingsContainer.querySelectorAll('.active')[0].classList.remove('active');
                    setTimeout(function () {
                        remove.classList.remove('show');
                        mech.transition = false;
                    }, 600);
                    setTimeout(function (e) {
                        mech.parentBlock.focus();
                    }, 0);
                    return false;
                } else {
                    if (current) {
                        this.container.classList.add('switch');
                        setTimeout(function (e) {
                            mech.parentBlock.settingsContainer.querySelectorAll('.active')[0].classList.remove('active');
                            current.classList.remove('show');
                            el.classList.add('show');
                            let offset = el.offsetHeight + 40;
                            mech.container.style.maxHeight = offset + 'px';
                            mech.parentBlock.el.style.marginBottom = offset + 10 + 'px';
                            btn.classList.add('active');
                            mech.container.classList.remove('switch');
                            el.dispatchEvent(new Event('show'));
                            mech.transition = false;
                        }, 350);
                        this.current = el;
                        return true;
                    }
                    this.current = el;
                    this.current.classList.add('show');
                    let offset = this.current.offsetHeight + 40;
                    this.container.style.maxHeight = offset + 'px';
                    this.parentBlock.el.classList.add('showMechanics');
                    this.parentBlock.el.style.marginBottom = offset + 10 + 'px';
                    btn.classList.add('active');
                    this.container.classList.remove('switch');
                    this.current.dispatchEvent(new Event('show'));
                    this.transition = false;
                    return true;
                }
            }
        }
    }

    class Mechanic {
        constructor(buttonSettings, className) {
            this.button = new DomButton(buttonSettings.title, buttonSettings.icon, buttonSettings.class);
            this.div = new DomEl('div.mechanics.' + className);
            this.registerBasicEvents();
            this.registerEvents();
        }

        focus() {
            this.div.focus();
        }

        getValues() {
            this.saveSettings();
            return this.settings;
        }

        init(Controller) {
            let mechanic = this;
            this.controller = Controller;
            this.registerSettings();
            Controller.parentBlock.settingsContainer.append(this.button);
            Controller.container.append(this.div);
            this.button.addEventListener('click', function (e) {
                e.preventDefault();
                Controller.toggleView(mechanic.div, this);
            });
            this.setFields();
            this.registerFields();
            return this;
        }

        registerBasicEvents() {
            let mech = this;
            this.div.addEventListener('keydown', function (e) {
                if (e.keyCode == 27) {
                    e.preventDefault();
                    mech.controller.toggleView(mech.div, mech.button);
                }
            });
            this.div.addEventListener('close', function () {
                mech.saveSettings();
            });
            this.div.addEventListener('show', function () {
                mech.focus();
            });
        }

        registerCloseButton() {
            let mech = this;
            this.closeButton = new DomButton('Close settings panel', false, 'closeBtn', 'Close');
            mech.div.append(this.closeButton);
            this.closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                mech.controller.toggleView(mech.div, mech.button);
            });
        }

        registerEvents() { }

        registerFields() {
            let mech = this;
            if (this.fields && this.fields.length > 0) {
                this.fields.forEach(function (field) {
                    mech.div.append(field);
                });
            }
            this.registerCloseButton();
        }

        registerSettings() {
            let mech = this;
            for (let [key, value] of Object.entries(this.settings)) {
                if (mech.controller.settings && typeof mech.controller.settings[key] !== 'undefined') {
                    mech.settings[key] = mech.controller.settings[key];
                } else {
                    mech.settings[key] = value;
                }
            }
        }

        saveSettings() {
            let mech = this;
            if (this.fields && this.fields.length > 0) {
                this.fields.forEach(function (field) {
                    field = field.children[0];
                    if (field.getAttribute('type') == 'checkbox') {
                        mech.settings[field.getAttribute('name')] = field.checked;
                    } else {
                        mech.settings[field.getAttribute('name')] = field.value;
                    }
                });
            }
        }
    }

    class SettingsMechanic extends Mechanic {
        constructor() {
            super({ title: 'Block settings', icon: 'cogs', class: 'settingsBtn' }, 'settingsDiv');
        }

        focus() {
            this.idField.children[0].focus();
        }

        setFields() {
            this.idField = new InputField('id', 'Block ID', 'AwesomeBlock', 'text', this.settings.id);
            this.classField = new InputField('class', 'Block classes', 'Space-separated list of classes', 'text', this.settings.class);
            this.fields = [
                this.idField,
                this.classField,
                new Checkbox('blockVisible', 'Block is visible on frontend', 'The block will not be visible. Hit spacebar to make it visible', 'The block will be visible. Hit spacebar to make it not visible', this.settings.blockVisible)
            ];
        }

        settings = {
            blockVisible: true,
            class: false,
            id: false,
        }
    }

    class Block {
        constructor(hat, data) {
            if (data) {
                if (data.content) {
                    this.content = data.content;
                }
                if (data.settings) {
                    this.settings = data.settings;
                }
            }
            this.setup();
            this.editor = hat;
            this.createElement();
            this.blockRegistration();
            this.registerMechanics();
            this.addGlobalEvents();
            this.addEvents();
            this.loadContent();
        }

        addBlockControls() {
            this.upButton = new DomEl('button[aria-label="Move block up one position"]');
            let upArrow = new DomEl('i.fas.fa-chevron-up');
            this.upButton.append(upArrow);
            this.moveButton = new DomEl('button[aria-label="Click and drag to move block"].handle');
            let gripIcon = new DomEl('i.fas.fa-grip-horizontal');
            this.moveButton.append(gripIcon);
            this.downButton = new DomEl('button[aria-label="Move block down one position]');
            let downArrow = new DomEl('i.fas.fa-chevron-down');
            this.downButton.append(downArrow);
            this.blockControlsContainer.append(this.upButton);
            this.blockControlsContainer.append(this.moveButton);
            this.blockControlsContainer.append(this.downButton);
            this.deleteButton = new DomButton('Delete block', 'trash-alt', 'deleteBtn');
            this.settingsContainer.append(this.deleteButton);
        }

        addGlobalEvents() {
            var block = this;
            this.el.addEventListener('keydown', function (e) {
                block.checkKeyboardShortcuts(e);
            });
            let blockContainer = this.editor.getBlockContainer();
            blockContainer.addEventListener('blockChanged', function () {
                block.checkBlockSettingsControls();
            });
            this.upButton.addEventListener('click', function (e) {
                e.preventDefault();
                block.moveBlock('up');
            });
            this.downButton.addEventListener('click', function (e) {
                e.preventDefault();
                block.moveBlock('down');
            });

            this.deleteButton.addEventListener('click', function (e) {
                e.preventDefault();
                let modal = new MiniModal({
                    cancelButtonTitle: 'Do not delete this block',
                    confirmButtonClass: 'deleteBtn',
                    confirmButtonText: 'Delete',
                    confirmButtonTitle: 'Yes, delete the block',
                    closeX: false,
                    content: 'Are you sure you want to delete this block?',
                    confirm: true
                });
                modal.addEventListener('confirmed', function () {
                    block.delete();
                });
                modal.addEventListener('canceled', function () {
                    block.focus();
                });
            });
        }

        addEvents() { }

        addInfoButton() {
            var infoButton = new DomEl('button.settings[aria-role="tab"][title="Open block settings dialog"][aria-selected="false"][tabindex="-1"][aria-controls="settings-info"]');
            var iconEl = new DomEl('i.fas.fa-info');
            infoButton.append(iconEl);
            this.settingsContainer.append(infoButton);
        }

        blockRegistration() { }

        checkBlockSettingsControls() {
            this.getPosition();
            let up = this.upButton;
            let down = this.downButton;
            let grip = this.moveButton;
            if (this.position.first) {
                up.setAttribute('disabled', '');
            } else {
                up.removeAttribute('disabled');
            }
            if (this.position.last) {
                down.setAttribute('disabled', '');
            } else {
                down.removeAttribute('disabled');
            }
            if (this.position.count == 1) {
                this.deleteButton.setAttribute('disabled', '');
                grip.setAttribute('disabled', '');
            } else {
                this.deleteButton.removeAttribute('disabled');
                grip.removeAttribute('disabled');
            }
        }

        checkKeyboardShortcuts(e) {
            if (e.ctrlKey | e.metaKey) {
                if (e.shiftKey) {
                    switch (e.keyCode) {
                        case 38:
                            this.moveBlock('up');
                            e.preventDefault();
                            break;
                        case 40:
                            this.moveBlock('down');
                            e.preventDefault();
                            break;
                    }
                } else {
                    switch (e.keyCode) {
                        case 8:
                        case 46:
                            this.delete();
                            e.preventDefault();
                            break;
                    }
                }
            }
            this.keyboardShortcuts(e);
        }

        createElement() { }

        delete() {
            this.editor.removeBlock(this);
        }

        focus() {
            this.contentEl.focus();
        }

        getElement() {
            return this.el;
        }

        getContents() {
            // This is absolutely just for documentation, you NEED to overwrite this method for your block
            let content = {
                content: this.contentEl.innerHtml(),
                settings: this.mechanic.getValues(),
                type: 'block'
            };
            return content;
        }

        getPosition() {
            this.position = this.editor.getBlockPosition(this.el);
        }

        keyboardShortcuts(e) { }

        loadContent() { }

        moveBlock(direction) {
            this.getPosition();
            if (this.position.count == 1 || this.position.first && direction == 'up' || this.position.last && direction == 'down') {
                return false;
            }
            var block = this;
            let opposite = (direction == 'up') ? 'down' : 'up';
            let target = (direction == 'up') ? block.el.previousSibling : block.el.nextSibling;
            let insertPoint = (direction == 'up') ? block.el.previousSibling : block.el.nextSibling.nextSibling;
            block.el.classList.add('moving-' + direction);
            target.classList.add('moving-' + opposite);
            setTimeout(function () {
                block.el.classList.remove('moving-' + direction);
                target.classList.remove('moving-' + opposite);
                block.editor.getBlockContainer().insertBefore(block.el, insertPoint);
                block.editor.fireEvent('blockChanged');
                block.focus();
            }, 200);
        }

        registerMechanics() {
            this.mechanic = new MechanicController(this);
            this.mechanic.add(new SettingsMechanic());
        }

        setup() {
            this.el = new DomEl('div.block');
            this.blockControlsContainer = new DomEl('div[aria-label="Block Controls"]');
            this.middleContainer = new DomEl('div.contentSection');
            this.contentContainer = new DomEl('div');
            this.middleContainer.append(this.contentContainer);
            this.settingsContainer = new DomEl('div[aria-role="tablist"][aria-label="Block settings]');
            this.el.append(this.blockControlsContainer);
            this.el.append(this.middleContainer);
            this.el.append(this.settingsContainer);
            this.addBlockControls();
        }
    }

    class CodeBlock extends Block {
        createElement() {
            this.el.classList.add('code');
            this.contentEl = new DomEl('textarea.codespace');
            this.contentContainer.appendChild(this.contentEl);
        }

        getContents() {
            let content = {
                settings: this.mechanic.getValues(),
                type: 'code',
                content: this.contentEl.value
            };
            return content;
        }

        keyboardShortcuts(e) {
            if (e.ctrlKey || e.metaKey) {
                switch (e.keyCode) {
                    // B
                    case 66:
                    // I
                    case 73:
                    // U
                    case 85:
                        e.preventDefault();
                        break;
                    case 32:
                        e.preventDefault();
                        document.execCommand('insertHTML', false, '\t');
                        break;
                }
            }
        }

        loadContent() {
            if (this.content) {
                this.contentEl.value = this.content;
                delete this.content;
            }
        }
    }

    class ImageBlock extends Block {
        addEvents() {
            let block = this;
            this.selectButton.addEventListener('click', function(e) {
                e.preventDefault();
                block.modal = new ImageLibraryModal();
                block.modal.modalContainer.addEventListener('confirmed', function (e) {
                    if (block.modal.library.selectedImage) {
                        let newImage = block.modal.library.selectedImage.dataset;
                        block.preview.src = newImage.imageUrl;
                        block.preview.classList.remove('hide');
                        block.selectedImageId = newImage.id;
                        for (let [idx, value] of Object.entries(['altText', 'imageCredit', 'caption'])) {
                            if (newImage[value] !== 'null') {
                                block[value].children[0].value = newImage[value];
                            }
                        }
                        block.form.classList.remove('hide');
                        block.removeButton.classList.remove('hide');
                        block.selectContainer.classList.add('hide');                       
                    }
                });
            });
            this.removeButton.addEventListener('click', function (e) {
                e.preventDefault();
                block.selectedImageId = false;
                block.preview.removeAttribute('src');   
                block.preview.classList.add('hide');
                for (let[idx, value] of Object.entries(['altText', 'imageCredit', 'caption'])) {
                    block[value].children[0].value = '';
                }
                block.form.classList.add('hide');
                block.removeButton.classList.add('hide');
                block.selectContainer.classList.remove('hide');
            });
        }

        createElement() {
            this.el.classList.add('image');
            this.form = new DomEl('form.hide');
            this.altText = new InputField('altText', 'Alt Text', 'All images should have alternative text unless they\'re purely decorative', 'text');
            this.imageCredit = new InputField('imageCredit', 'Image Credit', 'Credit for the photographer/illustrator/creator', 'text');
            this.caption = new InputField('caption', 'Caption', 'Text displayed along with the image', 'text');
            this.form.append(this.altText);
            this.form.append(this.imageCredit);
            this.form.append(this.caption);
            this.preview = new DomEl('img.preview.hide');
            this.selectContainer = new DomEl('div.selector.t-center.p-25');
            this.selectButton = new DomButton('Select image from library', 'images', 'primary stack inverse m-0-auto', 'Select Image');
            this.selectContainer.append(this.selectButton);
            this.removeButton = new DomButton('Select this to remove the current image', 'eye-slash', 'removeBtn stack', 'Remove image');
            this.removeButton.classList.add('hide');
            this.contentContainer.append(this.selectContainer);
            this.contentContainer.appendChild(this.removeButton);
            this.contentContainer.append(this.preview);
            this.contentContainer.append(this.form);
        }

        focus() {
            this.selectButton.focus();
        }

        getContents() {
            let content = {   
                settings: this.mechanic.getValues(),
                type: 'image',
                content: {
                    altText: this.altText.children[0].value,
                    caption: this.caption.children[0].value,
                    imageCredit: this.imageCredit.children[0].value,
                    imageUrl: this.preview.src,
                    imageId: this.selectedImageId
                }
            };
            return content;
        }

        loadContent() {
            if (this.content && this.content.imageUrl) {
                this.selectedImageId = this.content.imageId;
                this.altText.children[0].value = this.content.altText;
                this.caption.children[0].value = this.content.caption;
                this.imageCredit.children[0].value = this.content.imageCredit;
                this.preview.src = this.content.imageUrl;
                delete this.content;
                this.selectContainer.classList.add('hide');
                this.removeButton.classList.remove('hide');
                this.form.classList.remove('hide');
            }
        }
    }

    class CursorFocus {
        constructor(el) {
            el.focus();
            el.innerHTML = '<br>';
            let sel = window.getSelection();
            let range = document.createRange();
            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    class SelectionWrapper {
        constructor(tag, view, opts) {
            this.getSelection();
            if (this.sel.rangeCount) {
                if (view == 'content') {
                    if (typeof (tag) == 'object') {
                        switch (tag[0]) {
                            case 'ol':
                                var command = 'insertOrderedList';
                                break;
                            case 'ul':
                                var command = 'insertUnorderedList';
                                break;
                        }
                        if (!this.sel.anchorNode.parentElement.tagName.toLowerCase() == 'div' && this.sel.parentElement.parentElement.classList.hasClass('editContainer')) {
                            document.execCommand('formatBlock', false, 'div');
                        }
                        if (this.sel.anchorNode.parentElement.tagName.toLowerCase() == tag[0]) {
                            document.execCommand('indent');
                        } else {
                            document.execCommand(command);
                        }
                        this.checkNearestP(tag[0]);
                    } else {
                        var badTag = false;
                        var commandTag = false;
                        switch (tag) {
                            case 'strong':
                                var badTag = 'b';
                                var command = 'bold';
                                break;
                            case 'em':
                                var badTag = 'i';
                                var command = 'italic';
                                break;
                            case 'u':
                                var command = 'underline';
                                break;
                            case 'h1':
                            case 'h2':
                            case 'h3':
                            case 'h4':
                            case 'p':
                                var command = 'formatBlock';
                                commandTag = tag;
                                break;
                            case 'a':
                                var command = 'createLink';
                                commandTag = opts.href;
                                break;
                        }
                        document.execCommand(command, false, commandTag);
                        let parent = this.sel.anchorNode.parentElement;
                        this.getSelection();
                        if (tag == 'a') {
                            if (opts.target) {
                                parent.setAttribute('target', opts.target);
                            }
                            if (opts.text !== parent.innerText) {
                                let a = (parent.tagName.toLowerCase() == 'a') ? parent : this.sel.anchorNode;
                                let range = this.range;
                                parent.innerText = opts.text;
                                this.range.selectNode(a);
                            }
                        }
                        if (badTag && !this.sel.isCollapsed) {
                            let badEl = this.sel.focusNode.parentElement;
                            let newEl = new DomEl(tag);
                            newEl.innerHTML = badEl.innerHTML;
                            badEl.parentElement.insertBefore(newEl, badEl);
                            badEl.remove();
                            this.range.selectNode(newEl);
                        }
                    }
                } else {
                    let optString = '';
                    let text = this.sel.toString();
                    if (opts) {
                        optString = ' ';
                        if (opts.text) {
                            text = opts.text;
                            delete opts.text;
                        }
                        for (let [key, value] of Object.entries(opts)) {
                            optString += key + '="' + value + '" ';
                        }
                        optString = optString.substr(0, optString.length - 1);
                    }
                    let replacement = '';
                    let startPos = this.range.startOffset;
                    if (typeof (tag) == 'object') {
                        replacement = '<' + tag[0] + '><' + tag[1] + '>' + text + '</' + tag[1] + '></' + tag[0] + '>';
                    } else {
                        replacement = '<' + tag + optString + '>' + text + '</' + tag + '>';
                    }
                    document.execCommand('insertText', false, replacement);
                    this.getSelection();
                    this.range.setStart(this.range.startContainer, startPos);
                }
            }
        }

        checkNearestP(tag) {
            let nearestP = this.sel.anchorNode.parentElement.closest('p');
            if (nearestP && nearestP.childNodes[0].nodeName.toLowerCase() == tag) {
                let node = nearestP.childNodes[0];
                nearestP.parentNode.insertBefore(node, nearestP);
                nearestP.remove();
            }
        }

        getSelection() {
            this.sel = window.getSelection();
            this.range = this.sel.getRangeAt(0);
        }
    }

    class BrowserFormattingButton {
        constructor(title, icon, tag, parentBlock) {
            let button = new DomButton(title, icon);
            button.addEventListener('click', function (e) {
                e.preventDefault();
                new SelectionWrapper(tag, parentBlock.view);
            });
            return button;
        }
    }

    class LinkModal extends MiniModal {
        constructor(details) {
            super(false, true);
            if (details) {
                for (let [key, value] of Object.entries(details)) {
                    this[key] = value;
                }
            }
            this.setDefaults();
            this.createElements();
            this.constructModal(this.getModalOptions());
        }

        confirm() {
            if (this.hrefField.children[0].value) {
                this.values = {
                    href: this.hrefField.children[0].value,
                    text: this.textField.children[0].value
                };
                if (this.blankField.children[0].checked) {
                    this.values.target = '_blank';
                }
                this.modalContainer.dispatchEvent(new Event('confirmed'));
                this.confirmed = true;
                this.close();
            } else {
                new ErrorModal('You must include a link');
            }
        }

        createElements() {
            this.form = new DomEl('div#linkForm');
            this.hrefField = new InputField('linkHref', 'Link', 'https://google.com or tel:18009453669 or mailto:me@you.com', 'text', this.href);
            this.blankField = new Checkbox('targetBlank', 'Open in new window', 'Link will not open in new tab. Press spacebar to have link open in new tab', 'Link currently opens in new tab. Press spacebar to disable this', this.blank);
            this.textField = new InputField('displayText', 'Text to display', false, 'text', this.text);
            this.form.append(this.hrefField);
            this.form.append(this.textField);
            this.form.append(this.blankField);
        }

        getModalOptions() {
            return {
                confirm: true,
                confirmButtonTitle: 'Insert/update link',
                content: this.form,
                contentType: 'node',
                focusTarget: this.hrefField
            };
        }

        setDefaults() {
            let Modal = this;
            ['href', 'blank', 'text'].forEach(function (val) {
                if (!Modal[val]) {
                    Modal.val = false;
                }
            });
        }
    }

    class ParagraphToolbar {
        constructor(paragraphBlock) {
            this.parentBlock = paragraphBlock;
            this.container = new DomEl('div.toolbar[aria-label="Paragraph block toolbar"]');
            this.addHtmlView();
            this.addFormattingButtons();
            this.addHeaderButton();
            this.addImageButton();
            this.addLinkButton();
            this.addUnlinkButton();
            this.addFocusShield();
            this.setFormattingChecks();
            paragraphBlock.contentContainer.insertBefore(this.container, paragraphBlock.contentEl);
        }

        addFocusShield() {
            let toolbar = this;
            var timeout = false;
            this.parentBlock.contentContainer.addEventListener('focusin', function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                toolbar.contextButtons.forEach(function (el) {
                    el.removeAttribute('disabled');
                });
            });
            this.parentBlock.contentContainer.addEventListener('focusout', function () {
                /* Focusout will detect child focus outs (good), but even if we switch to another child, e.g., a button.
                We therefore check if the container contains the active element; if not, that means we disable the buttons.
                But focusout fires before the next focusin, so we delay slightly */
                timeout = setTimeout(function () {
                    if (!toolbar.parentBlock.contentContainer.contains(document.activeElement)) {
                        toolbar.contextButtons.forEach(function (el) {
                            el.setAttribute('disabled', 'disabled');
                        });
                    }
                }, 1);
            });
            toolbar.contextButtons.forEach(function (el) {
                el.setAttribute('disabled', 'disabled');
            });
        }

        addFormattingButtons() {
            this.paragraphBtn = new BrowserFormattingButton('Make selected text a paragraph', 'paragraph', 'p', this.parentBlock);
            this.container.append(this.paragraphBtn);
            this.boldBtn = new BrowserFormattingButton('Toggle selected text bold', 'bold', 'strong', this.parentBlock);
            this.container.append(this.boldBtn);
            this.italicBtn = new BrowserFormattingButton('Toggle selected text italic', 'italic', 'em', this.parentBlock);
            this.container.append(this.italicBtn);
            this.underlineBtn = new BrowserFormattingButton('Toggle selected text underlined', 'underline', 'u', this.parentBlock);
            this.container.append(this.underlineBtn);
            this.ulBtn = new BrowserFormattingButton('Toggle ordered list', 'list-ul', ['ul', 'li'], this.parentBlock);
            this.container.append(this.ulBtn);
            this.olBtn = new BrowserFormattingButton('Toggle ordered list', 'list-ol', ['ol', 'li'], this.parentBlock);
            this.container.append(this.olBtn);
            this.contextButtons = [this.paragraphBtn, this.boldBtn, this.italicBtn, this.underlineBtn, this.ulBtn, this.olBtn];
        }

        addHeaderButton() {
            let toolbar = this;
            ['h1', 'h2', 'h3', 'h4'].forEach(function (header) {
                let btn = new DomButton('Insert/convert to ' + header, false, 'textBtn', header);
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    new SelectionWrapper(header, toolbar.parentBlock.view);
                });
                toolbar.contextButtons.push(btn);
                toolbar.container.append(btn);
            });
        }

        addHtmlView() {
            let toolbar = this;
            let el = new DomButton('View HTML', 'laptop-code');
            el.addEventListener('click', function (e) {
                e.preventDefault();
                toolbar.toggleHtmlView();
            });
            toolbar.container.append(el);
        }

        addImage() {
            let sel = window.getSelection();
            let range = sel.getRangeAt(0);
            let image = new ImageLibraryModal();
            let toolbar = this;
            image.modalContainer.addEventListener('confirmed', function (e) {
                toolbar.returnCursor(sel, range);
                if (image.library.selectedImage) {
                    let newImage = image.library.selectedImage;
                    let imageContainer = new DomEl('figure');
                    let imageEl = new DomEl('img[src="' + newImage.dataset.imageUrl + '"][alt="' + newImage.dataset.altText + '"]');
                    imageContainer.append(imageEl);
                    if (newImage.dataset.photoCredit && newImage.dataset.photoCredit !== 'null') {
                        let creditEl = new DomEl('figcaption.credit');
                        creditEl.innerText = newImage.dataset.credit;
                        imageContainer.append(creditEl);
                    }
                    if (newImage.dataset.caption && newImage.dataset.caption !== 'null') {
                        let captionEl = new DomEl('figcaption.caption');
                        captionEl.innerText = newImage.dataset.caption;
                        imageContainer.append(captionEl);
                    }
                    if (toolbar.parentBlock.view == 'content') {
                        document.execCommand('insertHTML', false, imageContainer.outerHTML);
                    } else {
                        document.execCommand('insertText', false, imageContainer.outerHTML);
                    }
                    image.library.selectedImage = false;
                }
            });
            image.modalContainer.addEventListener('canceled', function (e) {
                toolbar.returnCursor(sel, range);
            });
        }

        addLink() {
            let sel = window.getSelection();
            let range = sel.getRangeAt(0);
            let options = {
                text: range.toString()
            };
            let anchorEl = sel.anchorNode.parentElement;
            let focusEl = sel.focusNode.parentElement;
            if (this.parentBlock.view == 'content') {
                if (sel.isCollapsed && anchorEl.tagName.toLowerCase() == 'a') {
                    options.href = anchorEl.getAttribute('href');
                    options.blank = (anchorEl.getAttribute('target') == '_blank');
                    options.text = anchorEl.innerText;
                    options.updateExisting = true;
                } else if (anchorEl == focusEl && anchorEl.tagName.toLowerCase() == 'a') {
                    options.href = anchorEl.getAttribute('href');
                    options.blank = (anchorEl.getAttribute('target') == '_blank');
                } else if (this.checkForTag('a', this.unlinkBtn)) {
                    let theTag = this.checkForTag('a', this.unlinkBtn);
                    options.href = theTag.getAttribute('href');
                    options.blank = (theTag.getAttribute('target') == '_blank');
                }
            }
            let link = new LinkModal(options);
            let toolbar = this;
            link.modalContainer.addEventListener('confirmed', function (e) {
                toolbar.returnCursor(sel, range);
                let values = link.values;
                if (link.updateExisting) {
                    let theLink = sel.anchorNode.parentElement;
                    theLink.setAttribute('href', values.href);
                    if (options.blank && theLink.getAttribute('target') !== '_blank') {
                        theLink.setAttribute('target', '_blank');
                    } else if (!options.blank && theLink.getAttribute('target') == '_blank') {
                        theLink.setAttribute('target', '');
                    }
                    theLink.innerText = values.text;
                    return true;
                }
                new SelectionWrapper('a', toolbar.parentBlock.view, values);
                toolbar.checkFormatting();
            });
            link.modalContainer.addEventListener('canceled', function (e) {
                toolbar.returnCursor(sel, range);
            });
        }

        addImageButton() {
            let toolbar = this;
            let el = new DomButton('Insert image', 'image');
            el.addEventListener('click', function (e) {
                e.preventDefault();
                toolbar.addImage();
            });
            this.contextButtons.push(el);
            toolbar.container.append(el);
        }

        addLinkButton() {
            let toolbar = this;
            let el = new DomButton('Insert Link', 'link');
            el.addEventListener('click', function (e) {
                e.preventDefault();
                toolbar.addLink();
            });
            this.contextButtons.push(el);
            toolbar.container.append(el);
        }

        addUnlinkButton() {
            let toolbar = this;
            this.unlinkBtn = new DomButton('Unlink text', 'unlink');
            this.unlinkBtn.setAttribute('disabled', true);
            this.unlinkBtn.addEventListener('click', function (e) {
                e.preventDefault();
                toolbar.unlink();
            });
            toolbar.container.append(this.unlinkBtn);
        }

        checkForDeepTag(tag) {
            if (!sel) {
                var sel = window.getSelection();
            }
            if (!range) {
                var range = sel.getRangeAt(0);
            }
            let contents = range.cloneContents();
            for (let theNode of contents.children) {
                if (theNode.tagName.toLowerCase() == tag) {
                    return theNode;
                }
            }
            return false;
        }

        checkForTag(tag, btn) {
            let found = false;
            let sel = window.getSelection();
            let range = false;
            let anchor = false;
            if (sel && sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
            }
            if (sel.anchorNode) {
                anchor = sel.anchorNode.parentElement;
                let focus = sel.focusNode.parentElement;
                // Check that we're actually in the edit container
                if (this.parentBlock.editEl.contains(anchor) && (anchor.tagName.toLowerCase() == tag || focus.tagName.toLowerCase() == tag)) {
                    found = true;
                }
            }
            switch (tag) {
                case 'a':
                    if (found || (anchor && this.parentBlock.editEl.contains(anchor)) && this.checkForDeepTag(tag)) {
                        btn.removeAttribute('disabled');
                    } else {
                        btn.setAttribute('disabled', true);
                    }
                    break;
            }
        }

        checkFormatting() {
            this.checkForTag('a', this.unlinkBtn);
        }

        returnCursor(sel, range) {
            if (this.parentBlock.view == 'content') {
                this.parentBlock.editEl.focus();
            } else {
                this.parentBlock.htmlEl.focus();
            }
            sel.removeAllRanges();
            sel.addRange(range);
            this.checkFormatting();
        }

        setFormattingChecks() {
            let toolbar = this;
            this.parentBlock.editEl.addEventListener('keydown', debounce((e) => {
                toolbar.checkFormatting();
            }, 350));
            this.parentBlock.editEl.addEventListener('click', function (e) {
                toolbar.checkFormatting();
            });
            this.parentBlock.editEl.addEventListener('focusin', function (e) {
                toolbar.checkFormatting();
            });
            this.parentBlock.contentContainer.addEventListener('viewChange', function (e) {
                toolbar.checkFormatting();
            });
        }

        toggleHtmlView() {
            if (this.parentBlock.view == 'content') {
                let code = this.parentBlock.getHtmlFromContent();
                this.parentBlock.htmlEl.innerText = code;
                this.parentBlock.view = 'html';
            } else {
                let html = this.parentBlock.getContentFromHtml();
                this.parentBlock.editEl.innerHTML = html;
                if (this.parentBlock.editEl.children) {
                    for (let el of this.parentBlock.editEl.children) {
                        if (!el.innerHTML) {
                            el.innerHTML = '<br>';
                        }
                    }
                }
                this.parentBlock.view = 'content';
            }
            this.parentBlock.editEl.classList.toggle('flip');
            this.parentBlock.htmlEl.classList.toggle('flip');
            this.parentBlock.contentContainer.dispatchEvent(new Event('viewChange'));
            this.parentBlock.focus();
        }

        unlink() {
            let link = false;
            let sel = window.getSelection();
            if (sel.anchorNode.parentElement.tagName.toLowerCase() == 'a') {
                link = sel.anchorNode.parentElement;
            } else if (sel.focusNode.parentElement.tagName.toLowerCase() == 'a') {
                link = sel.focusNode.parentElement;
            } else if (this.checkForDeepTag('a'))
                link = this.checkForDeepTag('a');
            if (link) {
                let oldRange = sel.getRangeAt(0);
                let range = new Range();
                range.selectNode(link);
                sel.removeAllRanges();
                sel.addRange(range);
                document.execCommand('unlink');
                sel.removeAllRanges();
                sel.addRange(oldRange);
            }
        }
    }

    class StylesMechanic extends Mechanic {
        constructor() {
            super({ title: 'Block styles', icon: 'paint-brush', class: 'styleBtn' }, 'styleDiv');
        }

        focus() {
            this.backgroundColor.children[0].focus();
        }

        setFields() {
            this.backgroundColor = new InputField('backgroundColor', 'Background color', '#FFF', 'text', this.settings.backgroundColor);
            this.textColor = new InputField('textColor', 'Text color', '#000', 'text', this.settings.textColor);
            //TODO: Version 2.0
            //this.background = new Checkbox('background', 'Has Background', 'There is no background set. Hit the space bar to set one', 'Hit the spacebar to unset the current background', this.hasBackground); /*
            this.fields = [
                this.backgroundColor,
                this.textColor
            ];
        }

        settings = {
            backgroundColor: false,
            textColor: false
        }
    }

    class ParagraphBlock extends Block {
        createElement() {
            this.el.classList.add('paragraph');
            this.contentEl = new DomEl('div.contentContainer');
            this.editEl = new DomEl('div[contentEditable=true].editContainer');
            // htmlEl is a contenteditable div, not a textarea, because textareas have too many issues re:selections, and the contenteditable div is manageable
            this.htmlEl = new DomEl('div.htmlView[contentEditable=true].flip');
            this.contentEl.appendChild(this.editEl);
            this.contentEl.appendChild(this.htmlEl);
            this.contentContainer.appendChild(this.contentEl);
            this.toolbar = new ParagraphToolbar(this);
        }

        focus() {
            if (this.view == undefined) {
                this.view = 'content';
                let starterP = new DomEl('p');
                this.editEl.append(starterP);
                new CursorFocus(starterP);
            } else if (this.view == 'content') {
                this.editEl.focus();
            } else {
                this.htmlEl.focus();
            }
        }

        getContents() {
            let content = {
                settings: this.mechanic.getValues(),
                type: 'paragraph'
            };
            if (this.view == 'content') {
                content.content = this.getHtmlFromContent();
            } else {
                content.content = this.getContentFromHtml();
            }
            return content;
        }

        getHtmlFromContent() {
            return this.editEl.innerHTML;
        }

        getContentFromHtml() {
            return this.htmlEl.innerText;
        }

        insideTag(tag) {
            if (this.view == 'content') {
                let sel = window.getSelection();
                if (sel.anchorNode.parentElement.closest(tag) && sel.anchorNode.parentElement.closest('.editContainer') == this.editEl) {
                    return true;
                } else if (sel.focusNode.parentElement.closest(tag) && sel.focusNode.parentElement.closest('.editContainer') == this.editEl) {
                    return true;
                }
            }
            return false;
        }

        keyboardShortcuts(e) {
            if (e.ctrlKey || e.metaKey) {
                if (e.shiftKey) {
                    switch (e.keyCode) {
                        case 80:
                            e.preventDefault();
                            new SelectionWrapper('p', this.view);
                            return false;
                        case 221:
                            e.preventDefault();
                            new SelectionWrapper(['ol', 'li'], this.view);
                            return false;
                        case 219:
                            e.preventDefault();
                            new SelectionWrapper(['ul', 'li'], this.view);
                            return false;
                        case 73:
                            this.toolbar.addImage();
                            e.preventDefault();
                            break;
                        case 75:
                            this.toolbar.unlink();
                            e.preventDefault();
                            return false;
                        case 49:
                            new SelectionWrapper('h1', this.view);
                            e.preventDefault();
                            return false;
                        case 50:
                            new SelectionWrapper('h2', this.view);
                            e.preventDefault();
                            return false;
                        case 51:
                            new SelectionWrapper('h3', this.view);
                            e.preventDefault();
                            return false;
                        case 52:
                            new SelectionWrapper('h4', this.view);
                            e.preventDefault();
                            return false;
                        case 186:
                            if (this.insideTag('ul') || this.insideTag('ol')) {
                                e.preventDefault();
                                document.execCommand('outdent');
                                return false;
                            }
                            break;
                        case 192:
                        case 222:
                            if (this.insideTag('ul') || this.insideTag('ol')) {
                                e.preventDefault();
                                document.execCommand('indent');
                                return false;
                            }
                            break;
                    }
                }
                switch (e.keyCode) {
                    case 66:
                        e.preventDefault();
                        new SelectionWrapper('strong', this.view);
                        return false;
                    case 73:
                        e.preventDefault();
                        new SelectionWrapper('em', this.view);
                        return false;
                    case 85:
                        e.preventDefault();
                        new SelectionWrapper('u', this.view);
                        return false;
                    case 75:
                        e.preventDefault();
                        this.toolbar.addLink();
                        return false;
                }
            }
        }

        loadContent() {
            if (this.content) {
                if (this.view == 'content' || this.view == undefined) {
                    this.editEl.innerHTML = this.content;
                    this.view = 'content';
                } else {
                    this.htmlEl.innerText = this.content;
                }
                delete this.content;
            }
        }

        registerMechanics() {
            super.registerMechanics();
            this.mechanic.add(new StylesMechanic());
        }
    }

    window.Hat = function (init, options) {
        let BlockRegistry = {
            names: ['code', 'image', 'paragraph'],
            objects: {
                code: {
                    class: CodeBlock,
                    description: 'For code/content that requires strict formatting',
                    icon: 'code',
                    name: 'Code',
                },
                image: {
                    class: ImageBlock,
                    description: 'For a single image',
                    icon: 'image',
                    name: 'Image'
                },
                paragraph: {
                    class: ParagraphBlock,
                    description: 'For regular text/content',
                    icon: 'edit',
                    name: 'Text'
                }
            }
        };
        let EditorRegistry = {
            add: function (hatInstance) {
                this.editors[hatInstance.getContainer()] = hatInstance;
            },
            editors: new Map()
        };
        let Options = {
            default: 'paragraph',
            init: true,
            selector: '.hat-editor'
        };
        let Interface = {
            createEditor: function (el) {
                let ed = new Editor(el);
                EditorRegistry.add(ed);
                return ed;
            },
            getBlock: function (blockName) {
                if (Interface.hasBlock(blockName)) {
                    return BlockRegistry.objects[blockName];
                } else {
                    return false;
                }
            },
            getBlocks: function () {
                return BlockRegistry.objects;
            },
            getBlockName: function (slug) {
                if (BlockRegistry[slug]) {
                    return BlockRegistry[slug].name;
                } else {
                    return false;
                }
            },
            getDefault: function () {
                return Options.default;
            },
            getEditor: function (el) {
                if (this.hasEditor(el)) {
                    return EditorRegistry.editors[el];
                } else {
                    return false;
                }
            },
            hasBlock: function (blockName) {
                return (BlockRegistry.names.indexOf(blockName) > -1);
            },
            hasEditor: function (el) {
                return (EditorRegistry.editors[el]);
            },
            getOption: function (opt) {
                if (Options.hasOwnProperty(opt)) {
                    return Options[opt];
                } else {
                    return false;
                }
            },
            registerBlock: function (slug, blockObj) {
                BlockRegistry.names.push(slug);
                BlockRegistry.objects[slug] = blockObj;
            },
            start: function (options) {
                for (let [key, value] of Object.entries(options)) {
                    Options[key] = value;
                }
                if (Options.data) {
                    let ed = new Editor(document.querySelector(Options.selector), Options.data);
                    EditorRegistry.add(ed);
                    return ed;
                } else if (Options.init) {
                    let elements = document.querySelectorAll(Options.selector);
                    if (elements.length == 1) {
                        return Interface.createEditor(elements[0]);
                    } else {
                        for (var el of elements) {
                            Interface.createEditor(el);
                        }
                    }
                }
            }
        };
        return Interface;
    }();

}());
