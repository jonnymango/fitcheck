#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const util = require('util');

const fsReaddir = util.promisify(fs.readdir);
const fsReadFile = util.promisify(fs.readFile);
const fsLstat = util.promisify(fs.lstat);

export async function fitCheck() {
  const args = process.argv.splice(process.execArgv.length + 2);
  const folder = args[0]
  const location = folder === undefined ? './' : folder
  await searchFilesInDirectoryAsync(location);
}


async function searchFilesInDirectoryAsync(dir: string) {  
  
  const ext = '.ts'
  const filterFit = '((fit))\\(';
  const filterDescribe = '((fdescribe))\\('
  const foundFiles = await getFilesInDirectoryAsync(dir, ext);
  let fitTotal: number = 0;
  let fdescribeTotal: number = 0;


  for (var file of foundFiles) {
      const fileContent = await fsReadFile(file);

      const regex = new RegExp(filterFit)
      if (regex.test(fileContent)) {
          console.log(`fit was found in file: ${file}`);
          fitTotal++;
      }

      const regexFdescribe = new RegExp(filterDescribe);
      if (regexFdescribe.test(fileContent)) {
        console.log(`fdescribe was found in file: ${file}`);
        fdescribeTotal++;
      }
      
  };

  fitTotal == 0 ? console.log("fit free 🎉🎉🎉") : console.log(`Total fits: ${fitTotal}`) 
  fdescribeTotal == 0 ? console.log("fdescribe free 🎉🎉🎉") : console.log(`Total fdescribes: ${fdescribeTotal}`) 
  
}

async function getFilesInDirectoryAsync(dir: string, ext: string) {
  let files: string[] = [];
  const filesFromDirectory = await fsReaddir(dir, {}).catch((err: any) => {
      throw new Error(err.message);
  });

  for (let file of filesFromDirectory) {
      const filePath = path.join(dir, file);
      const stat = await fsLstat(filePath);

      if (stat.isDirectory()) {
          const nestedFiles: any = await getFilesInDirectoryAsync(filePath, ext);
          files = files.concat(nestedFiles);
      } else {
          if (path.extname(file) === ext) {
              files.push(filePath);
          }
      }
  };

  return files;
}

fitCheck();