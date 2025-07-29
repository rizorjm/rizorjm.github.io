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

    // Multiple proxy endpoints to try
    var proxyEndpoints = [
        'https://thingproxy.freeboard.io/fetch/',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://crossorigin.me/',
        'https://cors-proxy.htmldriven.com/?url='
    ];

    var currentProxyIndex = 0;

    $scope.submitForm = function() {
        if ($scope.data.loading || !$scope.data.prompt.trim()) {
            return;
        }

        $scope.data.loading = true;
        $scope.data.result = '';
        $scope.data.error = '';
        $scope.data.editableResponse = '';
        currentProxyIndex = 0;

        tryWithProxy();
    };

    function tryWithProxy() {
        var apiKey = 'AIzaSyDYI5n4X1GbGnlmEsTgSMC8ZUm7Yt2Or7I';
        var geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
        
        var endpoint;
        if (currentProxyIndex < proxyEndpoints.length) {
            var proxy = proxyEndpoints[currentProxyIndex];
            if (proxy.includes('quest=') || proxy.includes('url=')) {
                endpoint = proxy + encodeURIComponent(geminiUrl);
            } else {
                endpoint = proxy + geminiUrl;
            }
        } else {
            // Try direct call as last resort (will likely fail due to CORS)
            endpoint = geminiUrl;
        }

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

        console.log('Trying proxy ' + (currentProxyIndex + 1) + ': ' + endpoint);

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
                console.log('Proxy ' + (currentProxyIndex + 1) + ' failed:', error);
                currentProxyIndex++;
                
                if (currentProxyIndex <= proxyEndpoints.length) {
                    // Try next proxy
                    setTimeout(tryWithProxy, 1000); // Wait 1 second before trying next proxy
                } else {
                    // All proxies failed
                    $scope.data.error = 'All CORS proxies failed. Please try again later or use a backend server.';
                    $scope.data.loading = false;
                    $scope.data.result = '';
                }
            });
    }
});
