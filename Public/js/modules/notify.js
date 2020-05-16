define(['jquery', 'sweetalert2'], function ($, swal) {
    var exports = {};
    
    var show_message = exports.show = function(type, message, options) {
        var params = {
            text: message
        };
        switch (type) {
            case 'error':
                params.type = 'error';
                break;
            case 'info':
                params.type = 'info';
                break;
            case 'success':
                params.type = 'success';
                break;
        }
        swal.fire(params);
    };

    exports.saved = function() {
        show_message('success', 'Saved!');
    };

    exports.show_error = function(message, options) {
        show_message('error', message);
    };
    
    return exports;
});