const splitDice = require('./splitDice');

test('single D20', () => {
  expect(splitDice('attack', 'D20'))
  .toEqual([{"name": "attack(0)", "roll": "D20"}]);
});

test('multiple D20 split with +', () => {
  expect(splitDice('attack', 'D20+D20'))
  .toEqual([
    {"name": "attack(0)", "roll": "D20"},
    {"name": "attack(1)", "roll": "D20"}]);
});

test('multiple D20 with multiplier', () => {
  expect(splitDice('attack', '3D20'))
  .toEqual([
    {"name": "attack(0)", "roll": "D20"},
    {"name": "attack(1)", "roll": "D20"},
    {"name": "attack(2)", "roll": "D20"}]);
});