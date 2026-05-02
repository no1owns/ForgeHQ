// public/dataOperations.js
import { supabase } from './src/supabaseConfig.js';

async function fetchSandwiches() {
  const { data, error } = await supabase
    .from('sandwiches')
    .select('*');

  if (error) {
    console.error('Error fetching sandwiches:', error.message);
  } else {
    console.log('Sandwiches fetched:', data);
    displaySandwiches(data);
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
