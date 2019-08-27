const START_PARENTH = '(';
const END_PARENTH = ')';
const CONJUNCTION = '|';

function expandLine(line) {
  let lines = [line];
  let finishedExpansion = false;
  while (finishedExpansion === false) {
    finishedExpansion = true;
    for (let i = 0; i < lines.length; i++) {
      let indexStartParenth = lines[i].indexOf(START_PARENTH);
      if (indexStartParenth < 0) {
        continue;
      }
      finishedExpansion = false;
      let currentLine = lines.splice(i, 1)[0];
      let indexEndParenth = currentLine.indexOf(END_PARENTH);
      let conjunctString = currentLine.substring(indexStartParenth + 1, indexEndParenth);
      let conjuncts = conjunctString.split(CONJUNCTION);
      for (let j = 0; j < conjuncts.length; j++) {
        let newLine = currentLine.replace(START_PARENTH + conjunctString + END_PARENTH, conjuncts[j]);
        lines.push(newLine);
      }
    }
  }
  return lines;
}

module.exports = { expandLine };
