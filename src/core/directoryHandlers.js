const fse = require('fs-extra');
const chalk = require('chalk');
const { continueWithDirectoryInteraction } = require('./directoryNavigation');
const { pathToRootDirectory } = require('../utils');
const {prompt} = require('../config');

// Function to create a new directory
function createNewDirectory() {
    prompt([
        {
            type: 'input',
            name: 'directoryName',
            message: 'Enter the name of the new directory: '
        }
    ])
    .then((answers) => {
        const fullDirectoryPath =
            pathToRootDirectory() + answers.directoryName;
        console.log('fullDirectoryPath: ', fullDirectoryPath);
        // Create new directory
        fse.ensureDir(fullDirectoryPath)
            .then(() => {
                console.log(
                    `New directory "${answers.directoryName}" created successfully.`
                );
                // Continue with directory interaction
                continueWithDirectoryInteraction(answers.directoryName);
            })
            .catch((err) => {
                console.error('Error creating directory:', err);
            });
    });
}

// Function to provide an existing directory
function useExistingDirectory() {    
    prompt([
        {
            type: 'input',
            name: 'directoryPath',
            message: 'Enter the path of the existing directory: '
        }
    ])
    .then((answers) => {
        const fullDirectoryPath =
            pathToRootDirectory(answers.directoryPath) + answers.directoryPath;
        // Check if directory exists
        fse.pathExists(fullDirectoryPath)
            .then((exists) => {
                if (exists) {
                    console.log(
                        chalk.green(`Existing directory "${chalk.bold(answers.directoryPath)}" loaded successfully.`)
                    );
                    // Continue with directory interaction
                    continueWithDirectoryInteraction(answers.directoryPath);                                                
                } else {
                    console.error(
                        chalk.yellow('Directory does not exist:'),
                        chalk.underline.bgRed(answers.directoryPath)
                    );
                    useExistingDirectory(); // Prompt user again
                }
            })
            .catch((err) => {
                console.error(
                    chalk.red('Error checking directory existence: '),
                    err
                );
            });
    });
}



module.exports = {
    createNewDirectory,
    useExistingDirectory    
};
