function($scope) {
  $scope.data = {
    prompt: '',
    imageBase64: '',
    imageType: '',
    result: '', // Only the answer, not the whole JSON
    editableResponse: '', // For the editable text box
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
    if ($event.keyCode === 13) {
      $event.preventDefault();
      $scope.submitForm();
    }
  };

  $scope.submitForm = function() {
    $scope.data.loading = true;
    $scope.data.result = '';
    $scope.data.error = '';
    $scope.data.editableResponse = '';
    $scope.server.update({
      prompt: $scope.data.prompt,
      imageBase64: $scope.data.imageBase64,
      imageType: $scope.data.imageType
    });
  };

  $scope.$watch('data.response', function(newVal) {
    if (!newVal) return;
    try {
      var respObj = typeof newVal === 'string' ? JSON.parse(newVal) : newVal;
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
    } catch(e) {
      $scope.data.result = newVal;
      $scope.data.editableResponse = newVal;
    }
    $scope.data.loading = false;
  });
}
