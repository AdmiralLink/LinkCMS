requirejs.config({
    paths: {
        'axios': 'lib/axios',
        'jquery': '//code.jquery.com/jquery-3.4.1.min',
        'lodash': 'lib/lodash',
        'notify': 'modules/notify',
        'parsley': 'lib/parsley',
        'quill': 'lib/quill.min',
        'start': 'lib/bootstrap',
        'sweetalert2': '//cdn.jsdelivr.net/npm/sweetalert2@8.18.6/dist/sweetalert2.all.min'
    }
});
require(['start']);

