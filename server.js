(function() {
  var prompt = input && input.prompt ? input.prompt : '';
  var imageBase64 = input && input.imageBase64 ? input.imageBase64 : '';
  var imageType = input && input.imageType ? input.imageType : '';

  // Build the Gemini API request body
  var payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  // Only add image if both type and data are present
  if (imageBase64 && imageType) {
    payload.contents[0].parts.push({
      inline_data: {
        mime_type: imageType,
        data: imageBase64
      }
    });
  }

  // Build and send REST Message
  var restMsg = new sn_ws.RESTMessageV2('Gemini_AI_FieldOPS', 'Default POST');
  restMsg.setRequestBody(JSON.stringify(payload));

  var response;
  try {
    response = restMsg.execute();
  } catch (e) {
    data.error = 'Error calling Gemini AI: ' + e.message;
    gs.error(data.error);
    return;
  }

  var respBody = response.getBody();
  gs.info('Gemini AI Response: ' + respBody);

  data.response = respBody;
})();
