function splitDice(name, diceOptions) {
    const allDice = [];
    diceOptions.split('+').forEach((d, i) => {
        allDice.push({ name: name + '(' + i + ')', roll: d });
    });
    return allDice;
}

module.exports = splitDice;
