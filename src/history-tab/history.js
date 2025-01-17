import {
    formatTimestamp,
    handleItemClick,
    toggleSortOrder,
    sortItemsBy,
    isValidUrl,
    formatLink,
} from '../utils/utils.js';

// Function to add a new item to the list
function addNewItem(element) {
    // Find the item list
    const itemList = document.getElementById('item-list');

    const website = element.website ?? element.frame;
    const script = element?.script;
    const time = formatTimestamp(element?.timestamp);

    const row = document.createElement('li');
    row.classList.add('item-container');

    // Create the "Script" cell as a link
    const scriptCell = document.createElement('a');
    const scriptParse = script.replaceAll('"', '').split('/');
    scriptCell.classList.add('script-cell');
    scriptCell.innerText = element.company ?? scriptParse[scriptParse.length - 1];

    // We create a link only if the script is actually a valid link
    if (isValidUrl(script.replaceAll('"', ''))) {
        scriptCell.classList.add('script-cell-link');
        scriptCell.href = script.replaceAll('"', ''); // Set the link URL
        scriptCell.title = 'Click to open in a new tab.';
    }

    // Create the "Website" cell as a link
    const websiteCell = document.createElement('a');
    websiteCell.classList.add('website-cell');
    websiteCell.innerText = formatLink(website);
    websiteCell.href = website; // Set the link URL
    websiteCell.title = 'Click to open in a new tab.';

    // Create the item wrapper html
    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add('item-wrapper');

    // Add time data
    const timeCell = document.createElement('div');
    timeCell.classList.add('time-cell');
    timeCell.innerText = time;

    // Add event listener to toggle details
    const arrow = document.createElement('img');
    arrow.classList.add('arrow', 'arrow-rotate');
    arrow.src = chrome.runtime.getURL('material_icons/navigate_next_icon.svg'); // Use chrome.runtime.getURL to get the extension's path
    arrow.style.width = '18px'; // Adjust the width and height as needed
    arrow.style.height = '18px';
    arrow.title = 'Show/hide details.';

    // Add event listener to toggle details
    arrow.addEventListener('click', () => {
        row.querySelector('.details-wrapper').classList.toggle('open');
        arrow.classList.toggle('rotate');
    });

    // Add event listener to prevent default action and open link in a new tab
    websiteCell.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(e.target.href, '_blank');
    });

    scriptCell.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(e.target.href, '_blank');
    });

    // Append cells and arrow to the wrapper
    itemWrapper.appendChild(scriptCell);
    itemWrapper.appendChild(websiteCell);
    itemWrapper.appendChild(timeCell);
    itemWrapper.appendChild(arrow);

    row.appendChild(itemWrapper);

    // Create details
    const detailsWrapper = document.createElement('div');
    detailsWrapper.classList.add('details-wrapper');
    const itemDetails = document.createElement('div');
    itemDetails.classList.add('details');
    detailsWrapper.appendChild(itemDetails);

    // Parse and format the JSON data as a dotted list
    const jsonData = element;
    const dottedListData = Object.keys(jsonData).map((key) => {
        let value = jsonData[key];
        let listItem = document.createElement('div');
        listItem.classList.add(key); // Add the bullet-point class
        let keyElement = document.createElement('b'); // Make the key element bold
        keyElement.textContent = `${key.replace(/^./, key[0].toUpperCase())}: `;
        listItem.appendChild(keyElement);
        if (isValidUrl(value)) {
            // Create link line
            const link = document.createElement('a');
            link.classList.add('line-link');
            link.innerText = formatLink(value);
            link.href = value; // Set the link URL
            link.title = 'Click to open in a new tab.';
            listItem.appendChild(link); // Append the value (not bold)
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(e.target.href, '_blank');
            });
            return listItem;
        }
        listItem.innerHTML += value; // Append the value (not bold)
        return listItem;
    });

    dottedListData.forEach((element) => {
        itemDetails.appendChild(element);
    });

    row.appendChild(detailsWrapper);

    // Append the row to the item list
    itemList.prepend(row);
}

// Function to add new items to the list
function addNewItems(parsedData) {
    // Loop over the entries and load them into the table
    parsedData.forEach((element) => {
        // Legacy for one random element
        let data = Array.isArray(element) ? element[0] : element;
        addNewItem(data);
    });
}

// Function to sort items based on the key
function sortItemsHtml(sortBy) {
    // Toggle the sort order
    currentSortOrder = toggleSortOrder(currentSortOrder);

    let dir = currentSortOrder === 'asc' ? 1 : -1;

    // Get the item list
    const itemList = document.getElementById('item-list');
    // Get the item containers
    const items = Array.from(itemList.querySelectorAll('.item-container'));
    // Sort the items based on the selected field
    items.sort((a, b) => {
        const scriptA = a.querySelector('.script-cell').textContent;
        const scriptB = b.querySelector('.script-cell').textContent;
        const timeA = new Date(parseInt(a.querySelector('.timestamp').textContent.split(' ')[1]));
        const timeB = new Date(parseInt(b.querySelector('.timestamp').textContent.split(' ')[1]));
        const webA = a.querySelector('.website-cell').textContent;
        const webB = b.querySelector('.website-cell').textContent;

        if (sortBy === 'script') {
            return dir * scriptA.localeCompare(scriptB);
        } else if (sortBy === 'timestamp') {
            return dir * (timeA - timeB);
        } else if (sortBy === 'website') {
            return dir * webA.localeCompare(webB);
        }
        return 0;
    });

    // Reorder the sorted items in the item list
    items.forEach((item) => {
        itemList.appendChild(item);
    });
}

// Function to sort items based on the key
function filterBy() {
    const inputField = document.querySelector('input[type="text"]');
    // Get the item list
    const itemList = document.getElementById('item-list');
    // Get the item containers
    const items = itemList.querySelectorAll('.item-container');
    const filterText = inputField.value.toLowerCase();
    items.forEach((container) => {
        const item = container.querySelector('.item-wrapper');
        const scriptText = item.querySelector('.script-cell').textContent.toLowerCase();
        const websiteText = item.querySelector('.website-cell').textContent.toLowerCase();
        if (scriptText.includes(filterText) || websiteText.includes(filterText)) {
            container.style.display = 'block'; // Show the item
        } else {
            container.style.display = 'none'; // Hide the item
        }
    });
}

// Define a variable to track the current sort order
let currentSortOrder = 'desc';

document.addEventListener('DOMContentLoaded', function () {
    const itemContainers = document.querySelectorAll('.item-container');
    const arrows = document.querySelectorAll('.arrow');
    const details = document.querySelectorAll('.details');
    const scriptHeader = document.getElementById('script-header');
    const websitetHeader = document.getElementById('website-header');
    const timeHeader = document.getElementById('time-header');
    const inputField = document.querySelector('input[type="text"]');

    // Add input event listener to the search input field
    inputField.addEventListener('input', filterBy);

    // Toggle the details section when an item is clicked
    itemContainers.forEach((container, index) => {
        // Handle click event for each item header
        handleItemClick(index, details, arrows);
    });

    // Sorting buttons listeners
    scriptHeader.addEventListener('click', () => {
        sortItemsHtml('script');
    });

    timeHeader.addEventListener('click', () => {
        sortItemsHtml('timestamp');
    });

    websitetHeader.addEventListener('click', () => {
        sortItemsHtml('website');
    });

    // Get all the entries
    chrome.storage.local.get(null).then((result) => {
        if (!result) {
            console.info('Data not found in storage ', JSON.stringify(result));
            return;
        }

        Object.keys(result).map((key) => {
            try {
                let value = result[key];
                let parsedData = JSON.parse(value);
                addNewItems(sortItemsBy(parsedData, 'timestamp', -1));
            } catch (error) {
                console.error('Error parsing history data:', error);
                return;
            }
        });
    });
});
