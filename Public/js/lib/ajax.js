class Ajax {
    constructor(url, data, progressBar) {
        this.xhr = new XMLHttpRequest();
        let fd = new FormData();
        for (let [key,value] of Object.entries(data)) {
            fd.append(key, value);
        }
        var xhr = new XMLHttpRequest();
        if (progressBar) {
            xhr.upload.addEventListener('progress', function(e) {
                progressBar.update( Math.round( (e.loaded * 100) /e.total) );
            });
        }
        let eventEl = new DomEl('div');
        xhr.responseType = 'json';
        xhr.open('POST', url);
        xhr.send(fd);
        xhr.onerror = function() { new ErrorModal('An error occurred during upload.'); };
        let ajax = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (xhr.response.type == 'error') {
                        new ErrorModal(xhr.response.message);
                        ajax.throwError(eventEl, progressBar);
                    } else {
                        for (let [key, value] of Object.entries(xhr.response)) {
                            eventEl.setAttribute(key, value);
                        }
                        if (progressBar) {
                            progressBar.update(100);
                        }
                        eventEl.dispatchEvent(new Event('success'));
                    }
                } else if (xhr.status == 410 || xhr.status === 404 || xhr.status == 403 || xhr.status === 401 ) {
                    new ErrorModal(xhr.status + ', check your upload URL');
                    ajax.throwError(eventEl, progressBar);
                } else if (xhr.status === 431 || xhr.status === 413) {
                    new ErrorModal(xhr.status + ', check your server settings');
                    ajax.throwError(eventEl, progressBar);
                } else {
                    new ErrorModal('Upload returned a ' + xhr.status + ' error');
                    ajax.throwError(eventEl, progressBar);
                }
            }
        };
        return eventEl;
    }

    throwError(eventEl, progressBar) {
        if (this.progressBar) {
            progressBar.update('failure');
        }
        eventEl.dispatchEvent(new Event('failure'));
    }
}

class ProgressBar {
    constructor(target, removeOnCompletion, type) {
        this.type = type || 'Upload';
        this.removeOnCompletion = removeOnCompletion;
        let notificationId = 'progress' + new Date().getMilliseconds();
        this.notification = new DomEl('div.sr-only[tab-index=0][aria-hidden=true][aria-live=assertive][aria-atomic=additions]#' + notificationId);
        this.notification.innerText = 'Press spacebar to get current value';
        this.track = new DomEl('div.progressBar[tab-index=1][role=progressbar][aria-describedby=' + notificationId + '][aria-valuenow=0]');
        let theBar = this;
        this.track.addEventListener('keydown', function(e) {
            if (e.keyCode == 32) {
                theBar.notify();
            }
        });
        this.bar = new DomEl('div.bar[tab-index=0]');
        this.track.append(this.bar);
        target.append(this.track);
        target.append(this.notification);
    }

    notify(num) {
        if (num == 'failure') {
            this.track.setAttribute('tab-index',0);
            this.notification.innerText = this.type + ' failed';
        } else if (num == 100) {
            this.track.setAttribute('tab-index',0);
            this.notification.innerText = this.type + ' Complete';
            if (this.removeOnCompletion) {
                let theBar = this;
                setTimeout(function() { 
                    theBar.track.remove();
                    theBar.notification.remove(); 
                }, 500);
            }
        } else {
            this.notification.innerText = num + '%';
        }
    }

    update(num) {
        this.bar.style.width = num + '%';
        if (num == 100) {
            this.bar.classList.add('done');
            this.notify(num);
        }
    }
}