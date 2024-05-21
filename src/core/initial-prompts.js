const {rl} = require('../config');
const {
    useExistingDirectory,
    createNewDirectory
} = require('./directoryHandlers');



// Function to display welcome message and initial prompt
function displayWelcomeMessage() {
    console.log('Welcome to the Interactive File Explorer!');
    console.log('-----------------------------------------');
    console.log('Do you want to:');
    console.log('1. Create a new directory');
    console.log('2. Provide an existing directory');
}

// Function to handle user input for initial prompt
function handleInitialPrompt() {
    rl.question('Enter your choice (1 or 2): ', (choice) => {
        if (choice === '1') {
            // Create new directory
            createNewDirectory();
        } else if (choice === '2') {
            // Provide existing directory
            useExistingDirectory();
        } else {
            console.log('Invalid choice. Please enter 1 or 2.');
            handleInitialPrompt(); // Prompt user again
        }
    });
}

module.exports = {
    displayWelcomeMessage,
    handleInitialPrompt
};
