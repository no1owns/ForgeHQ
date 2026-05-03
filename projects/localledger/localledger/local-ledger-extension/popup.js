document.addEventListener('DOMContentLoaded', function() {
    const findLocalButton = document.getElementById('findLocalButton');
    const amazonLinkInput = document.getElementById('amazonLink');
    const resultsContainer = document.getElementById('resultsContainer');

    findLocalButton.addEventListener('click', function() {
        const amazonLink = amazonLinkInput.value;

        if (amazonLink) {
            chrome.runtime.sendMessage({ type: "amazonLink", url: amazonLink }, function(response) {
              if (response && response.success) {
                  resultsContainer.textContent = response.message;
              } else if (response && response.error){
                  resultsContainer.textContent = response.error;
              }
              else {
                  resultsContainer.textContent = "An unknown error occured.";
              }
           });
        } else {
            resultsContainer.textContent = "Please paste an Amazon link.";
        }
    });
});
