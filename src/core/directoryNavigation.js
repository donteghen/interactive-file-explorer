const chalk = require('chalk');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const {prompt} = require('../config');
const { pathToRootDirectory } = require('../utils');
const {getAllDirectories, getAllFilesSync, getdirOrFileFromPath, getAndSortAllFilesSync} = require('../utils');


const CHOICES = [
    'Add subdirectory',
    'View contents of current directory',
    'Navigate into subdirectory',   
    'Navigate out to parent directory', 
    'Add new file',
    'Edit existing file',
    'Rename file',
    'Delete file',
    'Move file',
    'Search for file',
    'Sort files',
    'Exit the app'
]


// Function to continue with directory interaction
function continueWithDirectoryInteraction(directoryPath) {    
    setTimeout(() => { // we push this execution into a timer, make sure that it's push back into the callstack after directory loading or creation is completed
        console.log(`\n\nContinue interacting with : ${chalk.blue(directoryPath)}`);
        function runner () {            
            prompt([
                {
                    type: 'list',
                    message: 'What do you want to do with this directory ? ',
                    name: 'choice',
                    choices: CHOICES,
                    loop: false
                }
            ])
            .then(answers => {
                const fullDirectoryPath = pathToRootDirectory(directoryPath) + directoryPath;
                console.log('fullDirectoryPath', fullDirectoryPath)
                switch (answers.choice) {
                    case CHOICES[0]:
                        addSubDirectory(fullDirectoryPath);                        
                        break;

                    case CHOICES[1]:
                        listDirectoryContents(fullDirectoryPath);                        
                        break;

                    case CHOICES[2]:
                        navigateSubdirectory(fullDirectoryPath);
                        break;

                    case CHOICES[3]:
                        navigateOutOfDirectory(fullDirectoryPath);
                        break;

                    case CHOICES[4]:
                        addFile(fullDirectoryPath);
                        break;

                    case CHOICES[5]:
                        editFile(fullDirectoryPath);
                        break; 

                    case CHOICES[6]:
                        renameFile(fullDirectoryPath);
                        break;

                    case CHOICES[7]:
                        deleteFile(fullDirectoryPath);
                        break; 

                    case CHOICES[8]:
                        moveFile(fullDirectoryPath);
                        break;

                    case CHOICES[9]:
                        searchFile(fullDirectoryPath);
                        break;

                    case CHOICES[10]:
                        sortFiles(fullDirectoryPath);
                        break;  

                    case CHOICES[11]:
                        confirmExit(fullDirectoryPath);
                        break;                                           
                    default:
                        console.log('Invalid option! Please select a valid option.');
                        runner() ;                       
                }
            });
        }
        runner();
    }, 200);
}


function confirmExit (currentDir) {
    prompt([
        {
            type:'confirm',
            name: 'choice',
            message: 'You\'re about to exit the app. Sure that\'s what you want?',
            default: false
        }
    ])
    .then(answers => {    
        if (answers.choice) {                  
            console.log(`\n${chalk.bold.green('Goodbye! 👋')} \n${chalk.dim('See you next time! 🚀')}\n`);      
            process.exitCode = 1;
            process.nextTick(process.exit);            
        } 
        else {
            continueWithDirectoryInteraction(currentDir.split('/').pop());
        }
             
    });
}


// Function to list directory's content
function listDirectoryContents(directory) {
    console.log(`\n *** ${directory.split('/').pop()} ***`);

    if (!directory) {
        const error = new Error('directory not found!')
        throw error;
    }

    listDirectory(directory).then(() => {
        continueWithDirectoryInteraction(directory.split('/').pop());
    });
}

async function listDirectory(directoryPath, indent = '') {
    fse.readdir(directoryPath, (err, files) => {
        if (err) {   
            throw err;
        }

        files.forEach((file) => {
            const filePath = `${directoryPath}/${file}`;            
            fse.stat(filePath, (err, stats) => {
                if (err) {
                    throw err;
                }

                if (stats.isDirectory()) {
                    console.log(`${indent}📁 ${file}`);
                    listDirectory(filePath, `${indent}  `); // Recursively list subdirectory
                } else {
                    console.log(`${indent}📄 ${file}`);
                }
            });
        });
        
    });
}


// Function adds a child directory
async function addSubDirectory (currentDir) {
    prompt([
        {
            name: 'dirName',
            type:'input',
            message: 'Enter a name for the sub folder (directory) : ',
            validate: (input) => (input.trim().length > 1 && !input.trim().includes('.')) ? true : 'You first enter a valid name for the new sub folder : '
        }
    ])
    .then(answers => {
        const dirName = answers.dirName;
        fse.mkdir(`${currentDir}/${dirName}`)
        .then(() => {
            console.log('\n', chalk.green(`Successfully added ${chalk.bgGreen.bold(dirName)} to ${chalk.bgGreen.bold(currentDir.split('/').pop())}`));
            continueWithDirectoryInteraction(currentDir.split('/').pop());
        })
        .catch(err => {
            throw err;
        });
    });
}

// Function to navigate into subdirectories
function navigateSubdirectory(currentDirection) {
    getAllDirectories(currentDirection)
    .then(dirList => {        
        if (dirList.length === 0)  {
            setTimeout(() => {
                console.log(`\nDirectory ${currentDirection.split('/').pop()} has no subforlder! You are being redirected to the parent directory.\n`);
                navigateOutOfDirectory(currentDirection);
            }, 500);
        }
        else {
            prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: dirList.length > 1 ? 'Which sub directory do you wish to navigate into ?' : 'Select this directory to navigate into it :',
                    choices: dirList,
                    loop: false
                }
            ])
            .then(answers => {
                const fullPath = currentDirection + '/' + answers.choice;
                const choiceOptions = ['Continue With Navigation', 'Add a sub directory', 'Explore Directory Content', 'Exit the App'];
                prompt([
                    {
                        name: 'choice',
                        type: 'list',
                        message: 'What next would you like to do ? ',
                        choices: choiceOptions,
                        loop: false
                    }
                ])
                .then(answers => {
                    if (answers.choice === choiceOptions[0]) {
                        navigateSubdirectory(fullPath);
                    }
                    else if (answers.choice === choiceOptions[1]) {
                        addSubDirectory(fullPath);
                    }
                    else if (answers.choice === choiceOptions[2]) {
                        continueWithDirectoryInteraction(fullPath.split('/').pop());
                    }                    
                    else if (answers.choice === choiceOptions[3]) {
                        confirmExit(fullPath.split('/').pop());
                    }
                })
            });
        }
    }) ;     
}


function navigateOutOfDirectory(directory) {   
    let directories = directory.split('/');    
    directories = directories.slice(0, directories.length - 1);
    const parentDirectory = directories.join('/');        
    continueWithDirectoryInteraction(parentDirectory.split('/').pop());
}


function addFile(directory) {    
    prompt([
        {
            message: 'Enter file name: ',
            type: 'input',
            name: 'fileName'
        }
    ])
    .then(answers => {
        const fileName = answers.fileName;
        prompt([
            {
                message: 'Enter file extension: ',
                type: 'input',
                name: 'fileExt',
                default:'txt'
            }
        ])
        .then(answers => {
            const fileExt = answers.fileExt;
            fs.writeFile(`${directory}/${fileName}.${fileExt}`, '', err => {
                if (err) {
                    console.error('Error creating file:', err);
                    return;
                }
                console.log(`\nSuccessfully created file: ${fileName}.${fileExt}`);
                continueWithDirectoryInteraction(directory.split('/').pop());
            });           
        })
    })            
}


// Function to rename existing file within current directory
async function renameFile(directory) {
    const filePathList = getAllFilesSync(directory);
    const fileList = filePathList.map(path => path.slice(path.lastIndexOf('/') + 1));
    if (fileList.length === 0) {
        console.log(`\nThe directory ${directory.split('/').pop()} has no files!`);
        continueWithDirectoryInteraction(directory.split('/').pop());
    }
    else {
        prompt([
            {
                name: 'oldFile',
                type:'list',
                message: 'Select the file to be renamed: ',
                choices: fileList
            }
        ])
        .then(answers => {
            const oldFile = answers.oldFile;
            prompt([
                {
                    name: 'newName',
                    type: 'input',
                    message: 'Enter the new file name you want : '
                }
            ])
            .then(answers => {
                const newName = answers.newName;
                const oldPath = filePathList[fileList.indexOf(oldFile)];                    
                const newPath = oldPath.replace(oldFile, newName);
                fs.rename(oldPath, newPath, err => {
                    if (err) {
                        throw err;
                    }
                    console.log(`\nSuccessfully change file from ${oldFile} to ${newName}`);
                    continueWithDirectoryInteraction(directory.split('/').pop());
                });
            });
        })
    }
}


// Function to edit file within current directory
async function editFile(directory) {
    const filePathList = getAllFilesSync(directory);
    const fileList = filePathList.map(path => path.slice(path.lastIndexOf('/') + 1));
    if (fileList.length === 0) {
        console.log(`\nThe directory ${directory.split('/').pop()} has no file to edit !`);
        continueWithDirectoryInteraction(directory.split('/').pop());
    }
    else {
        prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Select the file to be edited:',
                choices: fileList
            }
        ])
        .then(answers => {
            const fileName = answers.choice;
            const filePathToEdit = filePathList[fileList.indexOf(fileName)]; 
            prompt([
                {
                    name:'content',
                    type:'editor',
                    message: 'Enter the file content: ',
                    validate(text) {
                        if (text.split('\n').length < 1) {
                          return 'Must be at least a line.';
                        }
                  
                        return true;
                      },
                      waitUserInput: true,
                }
            ])
            .then(answers => {
                const textContent = answers.content;
                fse.writeFile(filePathToEdit, textContent, {
                    encoding:'utf8'
                }, (err) => {
                    if (err) {
                        throw err;                    
                    }
                    console.log(`\n${fileName} has been successfully updated!`);
                    continueWithDirectoryInteraction(directory.split('/').pop());
                })
            })
        });
    }
}


// Function to delete a file within current directory
async function deleteFile(directory) {   
    const filePathList = getAllFilesSync(directory);
    const fileList = filePathList.map(path => path.slice(path.lastIndexOf('/') + 1));
    if (fileList.length === 0) {
        console.log(`\nThe directory ${directory.split('/').pop()} has no file to delete!`);
        continueWithDirectoryInteraction(directory);
    }
    else {
        prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Select the file to be deleted: (NB: You can\'t undo this action ⛔️)',
                choices: fileList
            }
        ])
        .then(answers => {
            const filePathToDelete = filePathList[fileList.indexOf(answers.choice)]; 
            fse.unlink(filePathToDelete, err => {
                if (err) {
                    throw err;
                }
                console.log(`\nSuccessfully deleted the file : ${answers.choice}`);                
                continueWithDirectoryInteraction(directory.split('/').pop());
            }) ;
        });
    }
}


// Function to move file between directories
async function moveFile(directory) {
    const filePathList = getAllFilesSync(directory);
    const fileList = filePathList.map(path => path.slice(path.lastIndexOf('/') + 1));
    if (fileList.length === 0) {
        console.log(`\nThe directory ${directory.split('/').pop()} has no files!`);
        continueWithDirectoryInteraction(directory.split('/').pop());
    }
    else {
        prompt([
            {
                name: 'oldFile',
                type:'list',
                message: 'Select the file to be renamed: ',
                choices: fileList
            }
        ])
        .then(answers => {
            const fileName = answers.oldFile
            const oldPath = filePathList[fileList.indexOf(fileName)];
            getAllDirectories(directory)
            .then(dirList => {        
                if (dirList.length === 0)  {                    
                    console.log(`\nDirectory ${directory.split('/').pop()} has no subdirectories! You need to create a subdirectory first.\n`);                                            
                    continueWithDirectoryInteraction(directory.split('/').pop());
                }
                else {
                    prompt([
                        {
                            type: 'list',
                            name: 'choice',
                            message: 'Select the new directory for your file: ',
                            choices: dirList,
                            loop: false
                        }
                    ])
                    .then(answers => {
                        const newPath = `${directory}/${answers.choice}/${fileName}`;                        
                        fse.rename(oldPath, newPath, (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log(`\nFile has been moved from 📂${getdirOrFileFromPath(oldPath, -1)} to 🗂${getdirOrFileFromPath(newPath, -1)}`);
                            continueWithDirectoryInteraction(directory.split('/').pop())
                        })
                    });
                }
            }) ;  
        })
    }
}


// Function to search for file by name or content
async function searchFile(directory) {
    prompt([
        {
            name: 'fileName',
            type: 'input',
            message: 'Enter the name of the file to search: ',
            validate: (input) => input.trim().length < 3 ? 'Please enter a valid file name' : true
        }
    ])
    .then(answers => {
        const fileName = answers.fileName;
        runSearch(directory, fileName)
        .then(() => {
            continueWithDirectoryInteraction(directory.split('/').pop());
        })        
    });
}


// Function that search for a file in side a nested directory recursively 
async function runSearch (directory, fileName) {    
    fs.readdir(directory, (error, files) => {
        if (error) {
            console.error(chalk.red('Error reading directory:'), error);
            continueWithDirectoryInteraction(directory.split('/').pop());
        }
        for (const file of files) {
            const filePath = path.join(directory, file);

            fs.stat(filePath, (error, stats) => {
                if (error) {
                    console.error(`\n${chalk.yellow('Error getting file stats for filePath: ') } ${chalk.underline.bgYellow.bold(filePath)} : `, error);                                        
                }

                if (stats.isDirectory()) {                    
                    runSearch(filePath, fileName);
                } 
                else if (file === fileName) {
                    console.log(`\n${chalk.green('File found! The path to file is : ')}`, chalk.underline.bgGreen.bold(filePath));                                       
                }
            });
        }
    });
}


// Function to get and sort the files in a provided directory based on provided sorting criteria
async function sortFiles (directory) {
    const files = getAllFilesSync(directory);
    if (files.length === 0) {
        console.log(`${chalk.yellow('The directory')} ${chalk.bgYellow.bold(directory.split('/').pop())} ${chalk.yellow('contains no file!')}`);
        continueWithDirectoryInteraction(directory.split('/').pop());
    }    
    const sortCriteriaOptions = ['created', 'lastModified', 'size'];
    const sortOrderOptions = ['asc', 'desc'];
    prompt([
        {
            name: 'sortCriteria',
            type: 'list',
            choices: ['1 ==> creation date', '2 ==> Last modification date', '3 ==> File size'],
            loop: false,
            message: 'Select a sorting criteria : '          
        }
    ])
    .then(answers => {
        const sortCriteria = sortCriteriaOptions[Number(answers.sortCriteria[0]) - 1];
        prompt([
            {
                name: 'sortOrd',
                type: 'list',
                choices: ['1 => Ascending', '2 => Descending'],
                loop: false,
                message: 'Select a sorting order : ' 
            }
        ])
        .then(answers => {
            const sortOrd = sortOrderOptions[Number(answers.sortOrd[0]) - 1];
            const result = getAndSortAllFilesSync(directory, {criteria: sortCriteria, order: sortOrd});
            console.log('\n******* Here is a summary of the files in the provided direction ******* ')
            // Print table header
            console.log(`\n${chalk.bold('FileName')}\t\t${chalk.bold('Created')}\t\t${chalk.bold('LastModified')}\t\t${chalk.bold('Size')}`);
            console.log('--------\t\t-------\t\t------------\t\t----');

            // Iterate over each object in the array and print row
            result.forEach(item => {
                console.log(`${chalk.green(item.fileName)}\t\t${chalk.cyan(new Date(item.created).toLocaleString())}\t\t${chalk.magenta(new Date(item.lastModified).toLocaleString())}\t\t${chalk.blue(item.size)}`);
            });
            continueWithDirectoryInteraction(directory.split('/').pop());
        });
    });
}


module.exports = {
    continueWithDirectoryInteraction,
    confirmExit,
    listDirectoryContents
};
