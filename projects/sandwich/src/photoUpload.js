import { supabase } from './supabaseConfig.js';

console.log('photoUpload.js loaded');

// Sanitize input values
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, ''); // Remove HTML tags
};

document.getElementById('photo-upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  console.log('Form submitted');

  const file = document.getElementById('photo-upload').files[0];
  const name = sanitizeInput(document.getElementById('sandwich-name').value.trim());
  const description = sanitizeInput(document.getElementById('photo-description').value.trim());
  const type = sanitizeInput(document.getElementById('sandwich-type').value.trim());

  if (!file) {
    console.error('No file selected');
    alert('Please select a photo to upload.');
    return;
  }

  if (!name) {
    console.error('No name provided');
    alert('Please provide a sandwich name.');
    return;
  }

  if (!description) {
    console.error('No description provided');
    alert('Please provide a description.');
    return;
  }

  if (!type) {
    console.error('No type provided');
    alert('Please select a sandwich type.');
    return;
  }

  const fileName = `${Date.now()}-${file.name}`; // Ensure unique file names

  console.log('Uploading file:', fileName);

  // Upload the file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(`public/${fileName}`, file);

  if (uploadError) {
    console.error('Error uploading photo:', uploadError.message);
    alert(`Error uploading photo: ${uploadError.message}`);
    return;
  }

  console.log('Photo uploaded:', uploadData);

  // Generate public URL for the uploaded file
  const { data: publicUrlData, error: urlError } = await supabase.storage
    .from('photos')
    .getPublicUrl(`public/${fileName}`);

  if (urlError) {
    console.error('Error getting public URL:', urlError.message);
    alert(`Error getting public URL: ${urlError.message}`);
    return;
  }

  console.log('Public URL Data:', publicUrlData);

  const photoUrl = publicUrlData.publicUrl;
  console.log('Public URL:', photoUrl);

  if (!photoUrl) {
    console.error('Public URL is null or undefined');
    alert('Error: Public URL is null or undefined');
    return;
  }

  // Log data to be inserted
  console.log('Inserting data:', {
    name,
    photo_url: photoUrl,
    description,
    type
  });

  // Save the photo URL, name, description, and type to the sandwiches table
  const { data: sandwichData, error: insertError } = await supabase
    .from('sandwiches')
    .insert([{ name, photo_url: photoUrl, description, type }]);

  console.log('Insert response:', { data: sandwichData, error: insertError });

  if (insertError) {
    console.error('Error saving sandwich:', insertError.message);
    alert(`Error saving sandwich: ${insertError.message}`);
  } else {
    console.log('Sandwich saved:', sandwichData);
    // Refresh the sandwich list
    await fetchSandwiches();
  }
});

// Fetch and Display Sandwiches
async function fetchSandwiches() {
  console.log('Fetching sandwiches...');
  const { data, error } = await supabase
    .from('sandwiches')
    .select('photo_url, description, name, type, date');

  if (error) {
    console.error('Error fetching sandwiches:', error.message);
    alert(`Error fetching sandwiches: ${error.message}`);
    return;
  }

  console.log('Sandwiches fetched:', data);

  if (data && data.length > 0) {
    displaySandwiches(data);
  } else {
    console.log('No sandwiches found');
  }
}

function displaySandwiches(sandwiches) {
  const sandwichList = document.getElementById('sandwich-list');
  sandwichList.innerHTML = '';

  sandwiches.forEach(sandwich => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <div class="content">
        <img src="${sandwich.photo_url}" alt="Sandwich Image">
        <div class="details">
          <h3>${sandwich.name}</h3>
          <p>${sandwich.description}</p>
        </div>
      </div>
      <div class="meta">
        <span class="type">${sandwich.type}</span>
        <span class="date">${new Date(sandwich.date).toLocaleDateString()}</span>
      </div>
    `;
    sandwichList.appendChild(listItem);
  });
}

// Initial fetch of sandwiches
document.addEventListener('DOMContentLoaded', fetchSandwiches);
