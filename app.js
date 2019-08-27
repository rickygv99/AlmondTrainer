const { Builder, By, Key, until } = require('selenium-webdriver');
const nReadLines = require('n-readlines');
const { expandLine } = require('./expansion');
const { username, password } = require('./config');
const fs = require('fs');

function getLinesFromFile(filePath) {
  var readLines = new nReadLines(filePath);
  var lines = [];
  var line;
  while (line = readLines.next()) {
    lines.push(line.toString('ascii'));
  }
  return lines;
}

function isCommand(line) {
  return line.charAt(0) === '?';
}

function prepareLines(lines) {
  var inputs = [];
  var command = '';
  for (let i = 0; i < lines.length; i++) {
    if (isCommand(lines[i])) {
      command = lines[i].slice(1);
    } else {
      let expansion = expandLine(lines[i]);
      for (let j = 0; j < expansion.length; j++) {
        inputs.push({ line: expansion[j], command: command});
      }
    }
  }
  return inputs;
}

function addInputToTrainedSentences(trainedSentences, input) {
  let indexSeparator = input.indexOf(':');
  let line = input.substring(0, indexSeparator);
  let command = input.substring(indexSeparator + 1);
  for (let i = 0; i < trainedSentences.length; i++) {
    indexSeparator = trainedSentences[i].indexOf(':');
    let trainedLine = trainedSentences[i].substring(0, indexSeparator);
    let trainedCommand = trainedSentences[i].substring(indexSeparator + 1);
    if (line === trainedLine) {
      if (command !== trainedCommand) {
        trainedSentences[i] = input;
      }
      return trainedSentences;
    }
  }
  trainedSentences.push(input);
  return trainedSentences;
}

(async function run() {
  let lines = getLinesFromFile('./sentences.txt');
  let inputs = prepareLines(lines);

  let trainedSentences = getLinesFromFile('./trained.txt');
  let outputStream = fs.createWriteStream('trained.txt', { flags: 'a' });

  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://almond.stanford.edu/user/login');
    await driver.findElement(By.id('username')).clear();
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).clear();
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.xpath("//button[@type='submit']")).click();
    await driver.wait(until.titleIs('Almond'), 10000);
    await driver.findElement(By.linkText('Console')).click();
    await driver.wait(until.titleIs('Almond Developer Console'), 10000);
    await driver.findElement(By.linkText('Train Almond')).click();
    await driver.wait(until.titleIs('Almond - Train Almond'), 10000);

    for (let i = 0; i < inputs.length; i++) {
      console.log("Input: " + inputs[i].line + " , Command: " + inputs[i].command);
      await driver.wait(until.elementLocated(By.id('utterance')), 10000).then((el) => {
        return el.clear();
      });
      await driver.wait(until.elementLocated(By.id('utterance')), 10000).then((el) => {
        return el.sendKeys(inputs[i].line, Key.RETURN);
      });
      await driver.wait(until.elementLocated(By.linkText('Let me write the ThingTalk code')), 10000).then((el) => {
        return el.click();
      });
      await driver.wait(until.elementIsVisible(driver.findElement(By.id('thingtalk'))), 10000).then((el) => {
        return el.sendKeys(inputs[i].command, Key.RETURN);
      });
      await driver.wait(until.elementIsVisible(driver.findElement(By.id('sentence-to-code-done'))), 10000).then((el) => {
        return el.click();
      });
      trainedSentences = addInputToTrainedSentences(trainedSentences, inputs[i].line + ':' + inputs[i].command)
    }
  } catch (e) {
    console.log(e);
  } finally {
    fs.writeFile('trained.txt', '');
    trainedSentences.sort();
    for (let i = 0; i < trainedSentences.length; i++) {
      outputStream.write(trainedSentences[i] + '\n');
    }
    await driver.close();
    outputStream.end();
  }
})();
