const types = [
  //"PhoneNumber", "CreditCard", "Custom", "Email", "Twitter", "StreetAddress",  "Currency", "Date", "URL", "EIN", "VAT", "ProductNumbers", "CaliforniaDriversLicense", "UKDriversLicense", "UKPassportNumber", "IndividualTaxpayerIdentificationNumber", "BankRoutingNumber", "TrackingNumber", "PotentialID", "Username", "Password", "Percentage", "FileIdNumber", "UkPostCode", "UKLicensePlate", "UK_NATIONAL_INSURANCE_NUMBER", "IBAN_CODE", "SWIFT_CODE", "CJIS_CODE",
  "PERSON_NAME",
  //"SocialSecurityNumber",
  //"US_DRIVERS_LICENSE_NUMBER"
];

$(function () {
  $("#types").text(types.join(', '));

  $("#user_profile_form").submit(function (event) {
    event.preventDefault();
    const postData = {
      "fullText": $('#fullText').val(),
      "types": types,
      "stringIndexType": "utf16CodeUnit",
    };

    $.post("https://detect-entities-function-azure-test.azurewebsites.net/api/detect_entities", JSON.stringify(postData),
      function (data) {
        const json = jQuery.parseJSON(data);
        console.log(json);
        showResults(json);
      });
  });

  $('#overall').mouseup(function () {
    const selectedText = getSelectedText().trim();
    if (selectedText.length > 0) {
      //alert(selectedText);
      let txtArea = document.getElementById("list");
      txtArea.value += selectedText + '\r\n';
    }
  });

  function getSelectedText() {
    if (window.getSelection) {
      return window.getSelection().toString();
    } else if (document.selection) {
      return document.selection.createRange().text;
    }
    return '';
  }

});

const showResults = (res) => {
  const resultsDiv = $('#results');
  resultsDiv.empty();
  let results = res.results[0].results;

  const requestTextArray = [];
  const fullText = $('#fullText').val();

  let idxArray = _.flatten([0, ...results.map(e => [e.firstIndex, e.lastIndex]), fullText.length]);
  console.log(idxArray);

  for (let i = 0; i < idxArray.length - 1; i++) {

    if (i % 2 === 0) { // if even
      requestTextArray.push(fullText.substring(idxArray[i], idxArray[i + 1]));

    } else {

      const resultsIdx = (i - 1) / 2;
      const confidence = results[resultsIdx].confidence;
      const entity_type = results[resultsIdx].type;
      const confidenceColor = confidence < 0.6 ? '#bc3e3e' : 'green';
      const entityColor = confidence < 0.6 ? '#ebebeb' : 'yellow';

      requestTextArray.push(`<span style="color:${confidenceColor}; font-weight: bold; background-color: ${entityColor}" title="type: ${entity_type} confidence: ${confidence}">` + fullText.substring(
        idxArray[i],
        idxArray[i + 1]) + `</span>`);
    }
  }

  // draw same spacing as text area
  $('#requestText').html(
    '<pre style="white-space: pre-wrap;">' +
    `Text Length: ${fullText.length}\n` +
    `Entities Found: ${res.results[0].entities_found}\n` +
    `Version: ${res.entity_detection_version}\n\n` +
    requestTextArray.join('') +
    '</pre>'
  );

  //results = _.orderBy(res.results[0].results, ['confidence'], ['desc']);

  results.forEach(entity => {
    console.log(entity.match);
    const entityElement = document.createElement('p');
    const confidenceColor = entity.confidence < 0.6 ? 'red' : 'green';

    entityElement.innerHTML = `
      <b>match:</b> <span style="color: ${confidenceColor}">${entity.match}</span>
      <b>type:</b> ${entity.type}
      <b>confidence:</b> <span style="color: ${confidenceColor}">${entity.confidence}</span>
      <b>idx:</b> ${entity.firstIndex}, ${entity.lastIndex}
    `;

    resultsDiv.append(entityElement);
  });
};

