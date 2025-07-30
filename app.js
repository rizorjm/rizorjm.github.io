const app = angular.module('aiAssistantApp', []);

app.controller('AIController', function($scope, $http) {
    $scope.data = {
        prompt: '',
        imageBase64: '',
        loading: false,
        result: '',
        error: '',
        editableResponse: ''
    };

   $scope.submitForm = function() {
        $scope.data.loading = true;
        $scope.data.result = '';
        $scope.data.error = '';
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: $scope.data.prompt
                }]
            }]
        };
        
        if ($scope.data.imageBase64) {
            requestBody.contents[0].parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: $scope.data.imageBase64
                }
            });
        }
        
        // Update this URL to your Vercel deployment
        $http.post('https://rizorjm-github-io.vercel.app/api/gemini', requestBody).then(function(response) {
            $scope.data.result = response.data;
            $scope.data.editableResponse = JSON.stringify(response.data, null, 2);
        }, function(error) {
            console.log('Error:', error);
            $scope.data.error = (error.data && error.data.error && error.data.error.message) 
                ? error.data.error.message 
                : 'Unknown error occurred';
        }).finally(function() {
            $scope.data.loading = false;
        });
    };

    $scope.fileChanged = function(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            $scope.$apply(function() {
                $scope.data.imageBase64 = e.target.result.split(',')[1];
            });
        };
        reader.readAsDataURL(file);
    };

    $scope.onKeyDown = function(event) {
        if (event.key === 'Enter' && !$scope.data.loading) {
            $scope.submitForm();
        }
    };
});
