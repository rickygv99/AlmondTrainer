let { expandLine } = require('./expansion');

let testCases = [
  {
    line: 'hello world',
    expansion: ['hello world']
  },
  {
    line: 'hello (world)',
    expansion: ['hello world']
  },
  {
    line: 'hello (world|mother)',
    expansion: ['hello world', 'hello mother']
  },
  {
    line: '(hello|goodbye|greetings) (world|mother)',
    expansion: ['hello world', 'goodbye world', 'greetings world', 'hello mother', 'goodbye mother', 'greetings mother']
  }
];

function run() {
  let numFailures = 0;
  for (let i = 0; i < testCases.length; i++) {
    let line = testCases[i].line;
    let expansion = testCases[i].expansion.sort();
    let expandedLine = expandLine(line).sort();
    if (areArraysEqual(expandedLine, expansion)) {
      console.log(`Test case ${i}: Passed`);
    } else {
      numFailures++;
      console.log(`Test case ${i}: Failed`);
      console.log(`    Generated: ${expandedLine}`);
      console.log(`    Expected: ${expansion}`);
    }
  }
  console.log(`Total passed: ${testCases.length - numFailures}, Total failed: ${numFailures}`);
}

function areArraysEqual(a1, a2) {
  if (a1 === null && a2 !== null) {
    return false;
  } else if (a1 === undefined && a2 !== undefined) {
    return false;
  } else if (a1 !== null && a2 === null) {
    return false;
  } else if (a1 !== undefined && a2 === undefined) {
    return false;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

run();
