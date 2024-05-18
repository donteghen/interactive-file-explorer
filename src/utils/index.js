const fse = require('fs-extra')

async function getAllDirectories (rootDirectory) {    
    let list = [];
    try {
        const files = await fse.readdir(rootDirectory);
        for (let file of files) {
            const filePath = rootDirectory + '/' + file;
            const stat = await fse.stat(filePath);
            if (stat.isDirectory()){
                list.push(file);
            }
        }
        return list;
    } catch (error) {
        throw error;
    }    
}


function getAllFilesSync (rootDirectory) {  
    const filelist = [];
    function dirReader (dir) {
        console.log('dir: ', dir)
        try {
            const files = fse.readdirSync(dir);
            for (let file of files) {
                const filePath = dir + '/' + file;
                const stat = fse.statSync(filePath);
                if (stat.isDirectory()){
                    dirReader(filePath)
                }
                else {
                    filelist.push(filePath);
                }
            }
            return filelist;
        } catch (error) {
            throw error;
        }
    }
        
    const list = dirReader(rootDirectory, []);
    return list;
}

function getAndSortAllFilesSync (rootDirectory, sortOption = {criteria: 'created', order: 'asc'}) {    
    const filelist = [];
    function dirReader (dir) {
        try {
            const files = fse.readdirSync(dir);
            for (let file of files) {
                const filePath = dir + '/' + file;
                const stat = fse.statSync(filePath);
                if (stat.isDirectory()){
                    dirReader(filePath)
                }
                else {
                    const fileObj = {
                        created: stat.birthtimeMs,
                        lastModified: stat.mtimeMs,
                        size: stat.size ,
                        fileName: file
                    }
                    filelist.push(fileObj);
                }
            }
            return filelist;
        } catch (error) {
            throw error;
        }
    }
        
    const list = dirReader(rootDirectory, []);    
    if (sortOption.criteria === 'lastModified') {
        return sortOption.order === 'asc' ? list.sort((fileObj1 , fileObj2) => fileObj1.lastModified - fileObj2.lastModified) : list.sort((fileObj1 , fileObj2) => fileObj2.lastModified - fileObj1.lastModified);
    }
    else if (sortOption.criteria === 'size') {
        return sortOption.order === 'asc' ? list.sort((fileObj1 , fileObj2) => fileObj1.size - fileObj2.size) : list.sort((fileObj1 , fileObj2) => fileObj2.size - fileObj1.size);
    }   
    else {
        return sortOption.order === 'asc' ? list.sort((fileObj1 , fileObj2) => fileObj1.created - fileObj2.created) : list.sort((fileObj1 , fileObj2) => fileObj2.created - fileObj1.created);
    } 
}
function getdirOrFileFromPath (path, revPosition) {
    if (!path) {
        throw new Error('Please provide a path!');
    } 
    const pathArray = path.split('/');
    const index = (pathArray.length - 1 ) + revPosition;
    return pathArray[index];
}

module.exports = {
    getAllDirectories, 
    getAllFilesSync,
    getdirOrFileFromPath,
    getAndSortAllFilesSync   
}