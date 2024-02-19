let trackedIds = {};
let isGM = false;
let me;

function roll(type) {
    let nameId = '';
    let diceId = '';
    switch (type)
    {
        case "standard":
            nameId = 'roll-name-standard-attack';
            diceId = 'roll-content-standard-attack';
        case "full":
            nameId = 'roll-name-full-attack';
            diceId = 'roll-content-full-attack';
    }
    if (nameId == '' || diceId == '')
        return;

    const name = document.getElementById(nameId).value;
    const dice = document.getElementById(diceId).value;
    const allDice = [];
    dice.split('+').forEach((d, i) => {
        allDice.push({ name: name + '(' + i + ')', roll: d });
    });
    console.log(allDice);
    TS.dice.putDiceInTray(allDice, true).then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });
}

async function handleRollResult(rollEvent) {
    if (trackedIds[rollEvent.payload.rollId] == undefined) {
        //if we haven't tracked that roll, ignore it because it's not from us
        return;
    }

    if (rollEvent.kind == "rollResults") {
        //user rolled the dice we tracked and there's a new result for us to look at
        let roll = rollEvent.payload
        let finalResult = 0;
        let resultGroup = {};
        if (roll.resultsGroups != undefined && roll.resultsGroups.length >= 2) {
            //just making sure the roll actually has 2 or more groups. should never be false as we created the roll with 2 groups
            if (trackedIds[roll.rollId] == "advantage") {
                //the incoming roll was stored as an advantage roll
                let max = 0;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    //if you want to check if the result returned here has an error, checking for groupSum.cause != undefined works
                    if (groupSum > max) {
                        max = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = max;
            } else if (trackedIds[roll.rollId] == "disadvantage") {
                //the incoming roll was stored as an disadvantage roll
                let min = Number.MAX_SAFE_INTEGER;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    //if you want to check if the result returned here has an error, checking for groupSum.cause != undefined works
                    if (groupSum < min) {
                        min = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = min == Number.MAX_SAFE_INTEGER ? 0 : min;
            } else {
                return;
            }
        }

        //finalResult remains unused in this example, but could be useful for other applications
        displayResult(resultGroup, roll.rollId);
    } else if (rollEvent.kind == "rollRemoved") {
        //if you want special handling when the user doesn't roll the dice
        delete trackedIds[rollEvent.payload.rollId];
    }
}

async function displayResult(resultGroup, rollId) {
    TS.dice.sendDiceResult([resultGroup], rollId).catch((response) => console.error("error in sending dice result", response));
}