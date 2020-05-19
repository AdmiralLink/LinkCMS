requirejs.config({
    paths: {
        'axios': 'lib/axios',
        'lodash': 'lib/lodash',
        'notify': 'modules/notify',
        'pristine': 'lib/pristine',
        'quill': 'lib/quill.min',
        'start': 'lib/bootstrap',
        'sweetalert2': '//cdn.jsdelivr.net/npm/sweetalert2@8.18.6/dist/sweetalert2.all.min'
    }
});
require(['start']);

