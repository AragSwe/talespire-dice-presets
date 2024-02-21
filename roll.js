let trackedIds = {};
let isGM = false;
let me;

window.addEventListener("load", (event) => {
});

function roll(type) {
    let diceId = getDiceId(type);
    if (diceId == '')
        return;

    if (type == "custom")
        rollCustom(diceId);
    else
        rollRegularAttack(diceId);
}

function rollRegularAttack(diceId) {
    let dice = document.getElementById(diceId).value;
    let allDice = [];
    for(let i = 0; i < dice; i++) {
        allDice.push({name: 'attack' + (i + 1), roll: 'd20'});
    }
    TS.dice.putDiceInTray(allDice, true).then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });
}

function rollCustom(diceId) {
    TS.dice.putDiceInTray([{name:'custom', roll:'2d20+3d10+1d4'}], false)/*.then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });*/
}

function getDiceId(type) {
    switch (type)
    {
        case "standard":
            return 'roll-content-standard-attack';
        case "full":
            return 'roll-content-full-attack';
        case "custom":
            return 'roll-content-custom';
        default: return '';
    }
}

async function handleRollResult(rollEvent) {
    let rollId = rollEvent.payload.rollId;
    if (trackedIds[rollEvent.payload.rollId] == undefined) {
        //if we haven't tracked that roll, ignore it because it's not from us
        console.log('untracked roll');
        return;
    }

    if (rollEvent.kind == "rollResults") {
        console.log('tracked roll');
        //user rolled the dice we tracked and there's a new result for us to look at
        let roll = rollEvent.payload;
        let critTrigger = document.getElementById('min-crit-range').value;
        let threatDice = [];

        for(let group of roll.resultsGroups) {
            let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
            if (groupSum >= critTrigger)
                threatDice.push({name:'threat ' + group.name, roll:'d20'});
        }

        TS.dice.putDiceInTray(threatDice, false);
        TS.dice.sendDiceResult(roll.resultsGroups, rollId).catch((response) => console.error("error in sending dice result", response));
    } else if (rollEvent.kind == "rollRemoved") {
        //if you want special handling when the user doesn't roll the dice
        delete trackedIds[rollEvent.payload.rollId];
    }
}
