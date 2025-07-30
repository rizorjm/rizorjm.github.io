const express = require('express');
const cors = require('cors');
const path = require('path');
// NEW
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Proxy endpoint for Gemini API
app.post('/api/gemini', async (req, res) => {
    try {
        const apiKey = 'AIzaSyDYI5n4X1GbGnlmEsTgSMC8ZUm7Yt2Or7I';
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ 
            error: { 
                message: error.message || 'Internal server error' 
            }
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

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
        $http.post('/api/gemini', {
            prompt: $scope.data.prompt,
            imageBase64: $scope.data.imageBase64
        }).then(function(response) {
            // Adjust this based on your backend's response structure
            $scope.data.result = response.data;
            $scope.data.editableResponse = JSON.stringify(response.data, null, 2);
        }, function(error) {
            $scope.data.error = (error.data && error.data.error && error.data.error.message) ? error.data.error.message : 'Unknown error';
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
