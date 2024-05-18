const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

function pathToRootDirectory(dirName) {    
    const pathToStorage = path.join(__dirname, '../../storage');
    if (dirName === 'storage') {
        return path.join(__dirname, '../../');
    }
    else {        
        const dirList = fse.readdirSync(pathToStorage, {recursive: true});
        if (dirList.some(dir => dir.includes(dirName))) {
            for (let dir of dirList) {
                if (dir.includes(dirName)) {
                    if (dir.split('/').length === 0) {
                        return pathToStorage;
                    }
                    else {
                        const indexOfDirName = dir.split('/').indexOf(dirName);
                        const dirParentPath = dir.split('/').slice(0, indexOfDirName).join('/');
                        return `${pathToStorage}/${dirParentPath}/`
                    }
                }            
            } 
        }
        else {
            console.log('Couldn\'t find the parent directory! You are being sent back to storage directory');
            return pathToStorage;
        }
                               
    }
    
}

module.exports = {
    pathToRootDirectory
};
