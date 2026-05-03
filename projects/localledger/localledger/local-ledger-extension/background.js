chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
        if (request.type == "amazonLink") {
            const amazonLink = request.url;

            fetch('http://localhost:5000/process_link', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ amazon_link: amazonLink })
             })
             .then(response => response.json())
             .then(data => {
                 if (data && data.message) {
                       sendResponse({ success: true, message: data.message });
                  }
                else if (data && data.error){
                   sendResponse({ success: false, error: data.error });
                }
              else {
                  sendResponse({ success: false, error: 'An unknown error occured with the API request'});
              }
              })
            .catch(error => {
                  sendResponse({ success: false, error: 'Error contacting the API' });
            });

         return true;
   }
});
