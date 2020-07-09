class DatePicker {
    constructor(date) {
        this.time = {};
        this.buildElements();
        if (date) {
            date = dayjs(new Date(date * 1000));
        } else {
            date = dayjs();
        }
        this.getDate(date);
        this.setDate();
        this.reflowCalendar();
        this.addEvents();
    }

    addEvents() {
        let date = this;
        this.ampmPicker.addEventListener('change', debounce((e) => {
            date.time.ampm = e.target.value;
            date.generateDate();
        }, 200));
        this.hourPicker.addEventListener('change', debounce((e) => {
            date.time.hour = parseInt(e.target.value);
            date.generateDate();
        }, 200));
        this.minutePicker.addEventListener('change', debounce((e) => {
            date.time.minutes = parseInt(e.target.value);
            date.generateDate();
        }, 200));
        this.monthPicker.addEventListener('change', debounce((e) => {
            date.time.month = parseInt(e.target.value);
            date.reflowCalendar();
        }, 200));
        this.yearPicker.addEventListener('change', debounce((e) => {
            date.time.year = parseInt(e.target.value);
            date.reflowCalendar();
        }, 200));
        this.days.forEach(function(day) {
            day.addEventListener('click', function(e) {
                e.preventDefault();
                date.dayContainer.querySelectorAll('.selected')[0].classList.remove('selected');
                date.time.day = parseInt(e.target.value);
                e.target.classList.add('selected');
                date.generateDate();
            });
        });
    }

    buildElements() {
        let picker = this;
        this.container = new DomEl('div.datePicker');
        this.monthPicker = new DomEl('select.month[aria-label="Select the month"]');
        dayjs.en.months.forEach(function(month) {
            let monthObj = new DomEl('option[value="' + dayjs.en.months.indexOf(month) + '"]');
            monthObj.innerText = month;
            picker.monthPicker.append(monthObj);
        });
        this.yearPicker = new DomEl('select.year[aria-label="Select the year"]');
        this.generateOptions(100, 1980, 'option', this.yearPicker);
        this.dayContainer = new DomEl('div.days');
        this.blanks = [];
        this.generateOptions(6, 1, 'div[tab-index=-1]', this.dayContainer, this.blanks, true);
        this.days = [];
        this.generateOptions(31, 1, 'button', this.dayContainer, this.days);
        let timeContainer = new DomEl('div.time');
        this.hourPicker = new DomEl('select.hour');
        this.generateOptions(12, 1, 'option', this.hourPicker);
        this.minutePicker = new DomEl('select.minutes');
        this.generateOptions(59, 0, 'option', this.minutePicker);
        this.ampmPicker = new DomEl('select.ampm');
        let am = new DomEl('option[value=am]');
        am.innerText = "a.m.";
        let pm = new DomEl('option[value=pm]');
        pm.innerText = "p.m.";
        this.ampmPicker.append(am);
        this.ampmPicker.append(pm);
        timeContainer.append(this.hourPicker);
        timeContainer.append(this.minutePicker);
        timeContainer.append(this.ampmPicker);
        this.container.append(this.monthPicker);
        this.container.append(this.yearPicker);
        this.container.append(this.dayContainer);
        this.container.append(timeContainer);
    }

    generateOptions(count, min, type, container, itemArray, blank) {
        Array.from(new Array(count), (x, i) => i + min).forEach(function(value) {
            let item = new DomEl(type + '[value="' + value + '"]');
            if (!blank) {
                if (value < 10) {
                    value = '0' + '' + value;
                }
                item.innerText = value;
            }
            if (itemArray) {
                itemArray.push(item);
            }
            container.append(item);
        });
    }

    reflowCalendar() {
        this.generateDate();
        let i = 0;
        for (i = 0; i < this.blanks.length; i++) {
            if (i < this.time.offset) {
                this.blanks[i].classList.remove('hide');
            } else {
                this.blanks[i].classList.add('hide');
            }
        }
        for (i = 0; i < this.days.length; i++) {
            if (i < this.time.maxDays) {
                this.days[i].classList.remove('hide');
            } else {
                this.days[i].classList.add('hide');
            }
            this.days[i].setAttribute('title', 'Select ' + this.time.month + i+1 + ', ' + this.time.year);
        }
    }

    generateDate() {
        let t = this.time;
        let date = dayjs();
        date = date.month(t.month);
        date = date.year(t.year);
        date = date.date(t.day);
        let hour = (t.ampm == 'am') ? t.hour : t.hour + 12;
        date = date.hour(hour);
        date = date.minute(t.minutes);
        this.getDay(date);
        this.getMonthInfo(date);
        this.getData(date);
    }

    getData(date) {
        this.time.string = date.format('MMM. DD YYYY h:mm a');
        this.time.timestamp = date.unix();
    }

    getDate(date) {
        this.time.month = date.month();
        this.time.year = date.year();
        this.getDay(date);
        this.getTime(date);  
        this.getMonthInfo(date);
        this.getData(date);
    }

    getDay(date) {
        this.time.day = date.date();
    }
    
    getMonthInfo(date) {
        this.time.maxDays = date.daysInMonth();
        this.time.offset = date.date(1).day();
    }

    getTime(date) {
        let hour = date.hour();
        if (hour > 12) {
            this.time.ampm = 'pm';
            this.time.hour = hour - 12;
        } else {
            this.time.ampm = 'am';
            this.time.hour = hour;
        }
        this.time.minutes = date.minute();
    }

    setDate() {
        this.yearPicker.value = this.time.year;
        this.monthPicker.value = this.time.month;
        this.days[this.time.day-1].classList.add('selected');
        this.hourPicker.value = this.time.hour;
        this.minutePicker.value = this.time.minutes;
        this.ampmPicker.value = this.time.ampm; 
    }
}

class DatePickerModal extends MiniModal {
    constructor(date) {
        let picker = new DatePicker(date);
        super({
            confirm: true,
            content: picker.container,
            contentType: 'node',
            focusTarget: picker.monthPicker,
            returnObject: 'object'
        });
        this.picker = picker;
    }
}