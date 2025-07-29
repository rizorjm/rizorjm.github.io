// Create AngularJS module and controller
angular.module('aiAssistantApp', [])
.controller('AIController', function($scope, $http) {
    $scope.data = {
        prompt: '',
        imageBase64: '',
        imageType: '',
        result: '',
        editableResponse: '',
        error: '',
        loading: false
    };

    $scope.fileChanged = function(element) {
        var file = element.files[0];
        if (!file) {
            $scope.data.imageBase64 = '';
            $scope.data.imageType = '';
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.$apply(function() {
                var base64String = e.target.result.split(',')[1];
                $scope.data.imageBase64 = base64String;
                $scope.data.imageType = file.type;
            });
        };
        reader.readAsDataURL(file);
    };

    $scope.onKeyDown = function($event) {
        if ($event.keyCode === 13 && !$scope.data.loading) {
            $event.preventDefault();
            $scope.submitForm();
        }
    };

    $scope.submitForm = function() {
        if ($scope.data.loading || !$scope.data.prompt.trim()) {
            return;
        }

        $scope.data.loading = true;
        $scope.data.result = '';
        $scope.data.error = '';
        $scope.data.editableResponse = '';

        var apiKey = 'AIzaSyDYI5n4X1GbGnlmEsTgSMC8ZUm7Yt2Or7I';
        
        // Try alternative CORS proxies
        var endpoint = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey);
        
        // Alternative proxies you can try:
        // var endpoint = 'https://thingproxy.freeboard.io/fetch/https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
        // var endpoint = 'https://api.codetabs.com/v1/proxy?quest=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;

        var body = {
            contents: [
                {
                    parts: [
                        { text: $scope.data.prompt }
                    ]
                }
            ]
        };

        // Only add image if one is uploaded
        if ($scope.data.imageBase64 && $scope.data.imageType) {
            body.contents[0].parts.push({
                inline_data: {
                    mime_type: $scope.data.imageType,
                    data: $scope.data.imageBase64
                }
            });
        }

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http.post(endpoint, body, config)
            .then(function(response) {
                console.log('API Response:', response);
                var respObj = response.data;
                var answer = '';
                if (respObj && respObj.candidates && respObj.candidates[0] &&
                    respObj.candidates[0].content &&
                    respObj.candidates[0].content.parts &&
                    respObj.candidates[0].content.parts[0] &&
                    respObj.candidates[0].content.parts[0].text) {
                    answer = respObj.candidates[0].content.parts[0].text;
                }
                
                $scope.data.result = answer;
                $scope.data.editableResponse = answer;
                $scope.data.loading = false;
                $scope.data.error = '';
            }, function(error) {
                console.log('API Error:', error);
                $scope.data.error = 'CORS proxy error. Try refreshing or check console for details.';
                $scope.data.loading = false;
                $scope.data.result = '';
            });
    };
});
