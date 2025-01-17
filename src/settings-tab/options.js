import {getStorageKey} from '../utils/utils.js';

document.addEventListener('DOMContentLoaded', function () {
    const removeCurrentTabButton = document.getElementById('removeCurrentTab');
    const removeAllButton = document.getElementById('clearAll');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const showStorageButton = document.getElementById('showStorage'); // Add this line

    // Function to get the current tab's URL
    function getCurrentTabUrl(callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (tabs.length === 0) {
                callback(null); // No active tabs
            } else {
                const currentTab = tabs[0];
                const tabUrl = currentTab.url;
                const formattedUrl = getStorageKey(tabUrl);
                callback(formattedUrl);
            }
        });
    }

    // // Function to retrieve and display Chrome storage content: DEBUG
    // function showStorageContent() {
    //     chrome.storage.local.get(null, function (data) {
    //         if (chrome.runtime.lastError) {
    //             showMessage('Error: Unable to retrieve storage content.');
    //         } else {
    //             // Convert the retrieved data to a JSON string for easy reading
    //             const jsonString = JSON.stringify(data, null, 2);
    //             console.log(jsonString);
    //             showMessage('Storage Content:\n' + jsonString);
    //         }
    //     });
    // }

    function showMessage(message) {
        feedbackMessage.textContent = message;

        // Show message with a fade-in
        feedbackMessage.classList.remove('hidden');

        // After a short delay, change the iframe source and show it with a fade-in effect
        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 20000); // Adjust the delay (2000)
    }

    // showStorageButton.addEventListener('click', showStorageContent); DEBUG

    removeCurrentTabButton.addEventListener('click', () => {
        // Get the current tab's URL
        getCurrentTabUrl(function (tabUrl) {
            if (tabUrl === null) {
                showMessage('Error: No active tab found.');
            } else {
                // Use the URL as a key to remove the entry associated with the current tab
                chrome.storage.local.remove(tabUrl, function () {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        showMessage('Error: Unable to remove entry.');
                    } else {
                        showMessage('Entry associated with the current tab has been removed.');
                    }
                });
            }
        });
    });

    removeAllButton.addEventListener('click', () => {
        // Clear all data in chrome.storage.local
        chrome.storage.local.clear(function () {
            if (chrome.runtime.lastError) {
                showMessage('An error occurred while removing all data: ', chrome.runtime.lastError);
            } else {
                // Show a success message
                showMessage('All entries have been cleared.');
            }
        });
    });
});
