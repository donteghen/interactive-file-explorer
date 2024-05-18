const inquirer = require('inquirer');

const prompt = inquirer.createPromptModule({ input: process.stdin, output: process.stdout });

module.exports = prompt;