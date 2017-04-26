# Promise Tree

Promise-tree enables writing of conditional javascript promise without nesting.

## Installing

Simply install with npm

```
npm install --save promise-tree
```

## Usage
### Require
```
const condition = require("promise-tree").condition;
const Branch = require("promise-tree").Branch;
```
### Inititialization
```
const branch_left = new Branch();
const branch_right = new Branch();
const promise = new Promise((resolve, reject) => { /* your code goes here */});
```
### Check conditions and start branching
```
promise
    .then((value) => {
        console.log("stem", 1);
        value++;
        return value;
    })
    .then((value) => {
        console.log("stem", 2);
        value++;
        throw value;
    })
    .catch((reason) => {
        console.log("stem", 3);
        condition.unless(condition_to_be_checked).with(reason).from(if_branching_from_then).along(branch_left);
        // e.g. condition.unless(1===2).with(reason).from(false).along(branch_left);
        reason++;
        return reason;
    })
    .then((value) => {
        console.log("a", 4);
        value++;
        
        condition.if(condition_to_be_cheched).with(value).from(if_branching_from_then).along(branch_right);
        // e.g. condition.if(1===1).with(value).from(true).along(branch_left);
        
        return value;
    })
    .then((value) => {
        console.log("a", 5);
        return value;
    });

branch_left
    .then((value) => {
        console.log("l", 1);
        value++;
        return value;
    })
    .then((value) => {
        console.log("l", 2);
        value++;
        return value;
    });

branch_right
    .then((value) => {
        console.log("r", 1);
        value++;
        return value;
    })
    .then(value => {
        console.log("r", 2);
        value++;
        return value;
    })
    .then(value => {
        console.log("r", 3);
        value++;
        return value;
    })
    .then(value => {
        console.log("r", 4);
        value++;
        return value;
    })
    .then(value => {
        console.log("r", 5);
        value++;
        return value;
    });
```

## API
### Branch - object
Include
```
const Branch = require("./index").Branch;
```
Constructor
```
const branch = new Branch();
```
Handlers
```
branch
  .then((value) => { /* your code goes here */})
  .catch((reason) => { /* your code goes here */});
```
Retrieve Promise object for later use
```
const promise = branch.promise;
console.log(branch.promise instanceof Promise); // true
console.log(branch instanceof Promise); // false
```
### Condition - JSON object
Include 
```
const condition = require("promise-tree").condition;
```
Branch indicator
```
// Indicating what branch you wish to go based on the condition.
condition.along(branch_left) // must be passed with a Branch object. Otherwise TypeError is thrown
```

Boolean checkers 
```
// bool is a boolean variable or expression. If true, the branch associated with this condition will be executed.
condition.if(bool); 
// bool is a boolean variable or expression. If true, the branch associated with this condition will NOT be executed.
condition.unless(bool);
```
Start place register
```
condition.from(true); // If true, it is indicating the branch starts inside Promise.then() or Branch.then().
condition.from(false); // If false, it is indicating the branch starts inside Promise.catch() or Branch.catch().
```
Value/Reason Passer
```
// Pass the value which will be used to initialize 
// the indicated branch as if the chain of branch is concatenated to that of stem promise
condition.with(value);  
condition.with(1234); // you can pass any value you want to initiate the branch, not only the value or reason from previous links.
```
Condition methods may be used together or seperately
```
// Used together, in any order
condition.if(!checking_some_condition()).from(true).with(250).along(weired_branch);
// Used seperately, in any order
let condition = condition.if(checking_some_condition());
condition = condition.along(not_so_weired_branch);
condition = condition.from(true);
condition = condition.with(250);
```
## Attention!
The indicated branch will not be executed if not all four condition methods have been called even if the condtiiton checked is true for 'if' or 'false' for 'unless'.
That is,
```
// In any of the cases below, the branch lonely_forever will not be called!!!
condition.if(true).with("NO!!!").along(lonely_forever);
condition.unless(false).with("I am drinking milkshake when I am typing this readme file").along(lonely_forever);
condition.along(lonely_forever).if(!("Milkshake" != " tastes good"));
condition.with("I don't even know where the cute lonely_forever is").unless(false);
```

## Utility
### Bank - JSON object
Bank is a utility object which enables user to pass information from one place to another in a promise or branch chain. The passing is not sequential and independent of the chain.
```
const promise = new Promise((resolve, reject) => {
    resolve(250);
});

const tag = "joke";
const group = "bad joke";

promise
    .then((value) => {
        // store value (250) in bank
        bank.deposit(tag, value , group); // Tag is a string to identify item. Group is a string to identify group
        return value;
    })
    .then((value) => {
        console.log("a", 2);
        value++;
        throw value;
    })
    .catch((reason) => {
        console.log("a", 3);
        reason++;
        return reason;
    })
    .then((value) => {
        console.log("a", 4);
        value++;
        
        console.log("stored item", bank.checkout(tag, group)); // retrieve stored item from bank
        return value;
    })
    .then((value) => {
        console.log("a", 5);
        return value;
    });
```
You may leave out group name when using bank.deposit. However, when doing so, you should also leave out group name in bank.checkout
## Authors

* **Zongli Shi** - *Initial work* - [shizongli94](https://github.com/shizongli94)

## License

This project is licensed under the GNU General Public License v3.0

