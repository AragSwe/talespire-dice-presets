let trackedIds = {};
let customCount = 0;

window.addEventListener("load", (event) => {
    addCustomRow();
});

function roll(type) {
    let diceId = getDiceId(type);
    if (diceId == '')
        return;
    
    rollRegularAttack(diceId, type);
}

function rollRegularAttack(diceId, type) {
    let dice = document.getElementById(diceId).value;
    let allDice = [];
    for(let i = 0; i < dice; i++) {
        allDice.push({name: 'attack' + (i + 1), roll: 'd20'});
    }
    TS.dice.putDiceInTray(allDice, true).then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });
}

function rollCustom(id) {
    const name = document.getElementById('roll-content-custom-name' + id).value;
    const dice = document.getElementById('roll-content-custom-dice' + id).value;
    TS.dice.putDiceInTray([{name: name, roll: dice}], false);
}

function rollAllCustom() {
    const allCustomDice = [];
    for (let i = 0; i < customCount; i++) {
        const name = document.getElementById('roll-content-custom-name' + i).value
        const dice = document.getElementById('roll-content-custom-dice' + i).value
        if (name != '' && dice != '')
            allCustomDice.push({name: name, roll: dice});
    }
    if (allCustomDice.length == 0)
        return;

    TS.dice.putDiceInTray(allCustomDice, false)/*.then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });*/
}

function addCustomRow() {
    var count = customCount++;
    const nameInput = document.createElement('input');
    nameInput.id = 'roll-content-custom-name' + count;
    const rollInput = document.createElement('input');
    rollInput.id = 'roll-content-custom-dice' + count;
    const label = document.createElement('label');
    label.innerHTML = "Custom";
    const spacer = document.createElement('span');
    spacer.setAttribute('class', 'spacer');
    const rollButton = document.createElement('button');
    rollButton.id = 'roll-custom' + count;
    rollButton.setAttribute('onclick', 'rollCustom(' + count + ')');
    rollButton.innerText = "R";
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'content-row');
    wrapper.appendChild(spacer);
    //wrapper.appendChild(label);
    wrapper.appendChild(nameInput);
    wrapper.appendChild(rollInput);
    wrapper.appendChild(rollButton);
    var customRowsPlaceHolder = document.getElementById('custom-rows');
    customRowsPlaceHolder.appendChild(wrapper);
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
