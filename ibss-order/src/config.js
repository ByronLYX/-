angular.module('ibss').provider('config', function() {
    return {
        $get: function() { return "IBSS Global Configurations"; },
        timeout: 3000
    };
});

angular.module('ibss').constant('IBSS_CONST', {
    // URL_UPLOAD_FILE: '/storage/upload',
    // URL_UPLOAD_IMAGE: '/storage/uploadimage',
    // UPLOAD_FILE_NAME:'upfile'
});