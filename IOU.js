// Application that keeps track of who owes what to who. 

/*
THE LOGIC OF THE APP STARTS HERE!!  ////////////////////////////////////////////////////////////////
*/

const { debug } = require("console");
const dinero = require("dinero.js");


var participants = [];        // an array to hold the participants

// a constructor to make a new participant
function Participant(name) {
  this.name = name;
  this.moneyPutIn = dinero({ amount: 0, currency: "EUR" });     // money they have contributed
  this.expenses = [];       // the name and amount of what the participant has paid
  this.owed = [];         // what is owed to who  
  this.totalOutstanding = dinero({ amount: 0, currency: "EUR" }); // outstanding amount to be paid or received.
  this.expensePaid = function (expenseName, cash) {      // a method that adds a participant's expenses to 
    var money = dinero({ amount: Math.round(cash * 100), currency: "EUR" })
    this.expenses.push({ expense: expenseName, paid: money });   // his expenses list and to his total paid.
    this.moneyPutIn = this.moneyPutIn.add(money);    // add to total balance
    return money;
  }
}


// adds a participant to the participants array 
function addParticipant(participants, person) {
  participants.push(person);
  return participants;
}


// a function to calculate the total money in the pot
function totalAmount(participants) {
  var total = dinero({ amount: 0, currency: "EUR" });
  for (var i = 0; i < participants.length; i++) {
    total = total.add(participants[i].moneyPutIn);
  }
  return total;
}

// What each participant should end up paying.
function averageAmount(participants) {
  return totalAmount(participants).divide(participants.length)
}

// Balances out the remaining cents.
function remainder(participants) {
  var rest = totalAmount(participants).subtract(averageAmount(participants).multiply(participants.length)).getAmount();
  if (rest < -1) {
    for (let i = 0; i < Math.abs(rest); i++) {
      participants[i].totalOutstanding = participants[i].totalOutstanding.add(dinero({ amount: 1, currency: "EUR" }));
    }
  } else if (rest > 1) {
    for (let i = 0; i < Math.abs(rest); i++) {
      participants[i].totalOutstanding = participants[i].totalOutstanding.subtract(dinero({ amount: 1, currency: "EUR" }));
    }
  }
}


//calculates what each person has put in, in relation to the average
function outstandings(averageAmount, participants) {
  var average = averageAmount(participants)
  for (var i = 0; i < participants.length; i++) {
    participants[i].totalOutstanding = participants[i].moneyPutIn.subtract(average);
  }
  remainder(participants);
}


// checks if there are any possitive amounts matching negative ones
function equalAmountChecker(pax) {
  for (var i = 0; i < pax.length; i++) {    // loop through from first element
    for (var j = 1; j < pax.length - i; j++) {   //loop through the elements starting from the one after the above
      if (!pax[i].totalOutstanding.equalsTo(dinero({ amount: 0, currency: "EUR" })) && pax[i].totalOutstanding.add(pax[i + j].totalOutstanding).equalsTo(dinero({ amount: 0, currency: "EUR" }))) {
        if (pax[i].totalOutstanding.greaterThan(pax[i + j].totalOutstanding)) {
          pax[i + j].owed.push({ owedTo: pax[i].name, owed: pax[i + j].totalOutstanding })  //adds who owes what to who.
          pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });  // balance thins out between the two participants
          pax[i + j].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
          console.log(pax[i].name + pax[i + j].name);
        } else {
          pax[i].owed.push({ owedTo: pax[i + j].name, owed: pax[i].totalOutstanding }) // same as above
          pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
          pax[i + j].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
        }
      }
    }
  }
}


//sort function to order the outstanding amounts in decending order.
function orderer(person1, person2) {
  if (person1.totalOutstanding.greaterThan(person2.totalOutstanding)) {
    return -1;
  } else if (person1.totalOutstanding.equalsTo(person2.totalOutstanding)) {
    return 0;
  } else {
    return 1;
  }
}


//balance out everyones outstandings 
function equalizer(pax) {
  pax.sort(orderer);
  for (var j = 0; j < 100; j++) {
    for (var i = 0; i < pax.length / 2; i++) {
      if (pax[i].totalOutstanding.greaterThan(pax[pax.length - 1 - i].totalOutstanding) && pax[i].totalOutstanding.greaterThan(dinero({ amount: 0, currency: "EUR" })) && pax[pax.length - 1 - i].totalOutstanding.lessThan(dinero({ amount: 0, currency: "EUR" }))) {
        pax[i].totalOutstanding = pax[i].totalOutstanding.add(pax[pax.length - 1 - i].totalOutstanding);
        pax[pax.length - 1 - i].owed.push({ owedTo: pax[i].name, owed: pax[pax.length - 1 - i].totalOutstanding })
        pax[pax.length - 1 - i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
      } else if (pax[i].totalOutstanding.lessThan(pax[pax.length - 1 - i].totalOutstanding) && pax[i].totalOutstanding.greaterThan(dinero({ amount: 0, currency: "EUR" })) && pax[pax.length - 1 - i].totalOutstanding.lessThan(dinero({ amount: 0, currency: "EUR" }))) {
        pax[pax.length - 1 - i].totalOutstanding = pax[i].totalOutstanding.add(pax[pax.length - 1 - i].totalOutstanding);
        pax[pax.length - 1 - i].owed.push({ owedTo: pax[i].name, owed: (pax[i].totalOutstanding) })
        pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
      } else if (pax[i].totalOutstanding.add(pax[pax.length - 1 - i].totalOutstanding).equalsTo(dinero({ amount: 0, currency: "EUR" })) && pax[i].totalOutstanding.greaterThan(dinero({ amount: 0, currency: "EUR" }))) {
        pax[pax.length - 1 - i].owed.push({ owedTo: pax[i].name, owed: pax[pax.length - 1 - i].totalOutstanding })
        pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
        pax[pax.length - 1 - i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
      }
    }
    pax.sort(orderer);
  }
}

// Clear what everyone owes to eachother.
function clearOwed(participants) {
  for (let i = 0; i < participants.length; i++) {
    participants[i].owed = [];
  }
}

// Re-compute everyones debts.
function computeDebts(participants) {
  clearOwed(participants);
  outstandings(averageAmount, participants);
  equalAmountChecker(participants);
  equalizer(participants);
}



/*
THE INTERACTION WITH THE DOM STARTS HERE!! ////////////////////////////////////////////////////////////////
*/


// Button to add a participant.
var nameButton = document.getElementById("name-button");
nameButton.onclick = inputParticipant;


// Button to add an expense.
var expenseButton = document.getElementById("expense-button");
expenseButton.onclick = inputExpense;


// Button to delete a participant.
var deleteButton = document.getElementById("delete-button");
deleteButton.onclick = deleteParticipant;


// Button to delete an expense.
var deleteExpenseButton = document.getElementById("delete-expense-button");
deleteExpenseButton.onclick = deleteExpense;


//Setting up the enter key for the forms

var forms = ["name-form", "expense-form",  "delete-form", "delete-expense-form"];
var buttons = ["name-button", "expense-button",  "delete-button", "delete-expense-button"]

function setKeySubmision(forms, buttons) {
  for (let i = 0; i < 4; i++) {
    let form = document.getElementById(forms[i]);
    let button = document.getElementById(buttons[i]);
    form.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        e.preventDefault();
        button.click();
        return false;
      }
    })
  }
}

setKeySubmision(forms, buttons);
totalExpeditureInGui(participants);


// Add a participant to the application
function inputParticipant() {
  var inserted = document.getElementById("new-name");
  if (inserted.value == "") {
    alert("Please enter a participant before submitting.")
  } else {
    var person = new Participant(inserted.value);
    addParticipant(participants, person);
    inserted.value = "";
    computeDebts(participants);
    participantInGui(person);
    globalUpdateGui(participants);
  }
}


//Add an expense for a participant 
function inputExpense() {
  let person = document.getElementById("payer-name");
  let expenseName = document.getElementById("expense-name");
  let amount = document.getElementById("expense-amount");
  let isParticipant = false;
  if (!expenseName.value) {
    alert("There was no expense typed.")
  } else if (!amount.value) {
    alert("There was no amount typed.")
  } else {
    for (let i = 0; i < participants.length; i++) {
      if (person.value == participants[i].name) {
        participants[i].expensePaid(expenseName.value, amount.value);
        computeDebts(participants);
        globalUpdateGui(participants);
        isParticipant = true;
        break;
      }
    }
    if (!isParticipant) {
      alert("Please enter a valid participant name.");
    }
    totalExpeditureInGui(participants);
    person.value = "";
    expenseName.value = "";
    amount.value = "";
  }
}


/*
Displaying outputs starts here. /////////////////////////////////////////////////////////////////////////////
*/


//Add a participant to the gui
function participantInGui(participant) {
  let participantToggle = document.createElement("select");
  participantToggle.setAttribute("id", participant.name);
  participantInfoGui(participant, participantToggle);
  let place = document.getElementById("individual-outputs");
  place.appendChild(participantToggle);
}

//Update participant information in the gui
function participantUpdateGui(participant) {
  let newToggle = document.createElement("select");
  participantInfoGui(participant, newToggle);
  let oldToggle = document.getElementById(participant.name)
  let place = document.getElementById("individual-outputs");
  place.replaceChild(newToggle, oldToggle);
  newToggle.setAttribute("id", participant.name);
}

// Update everybody's information in the gui.
function globalUpdateGui(participants) {
  for (let i = 0; i < participants.length; i++) {
    participantUpdateGui(participants[i]);
  }
  totalExpeditureInGui(participants);
}


//Participant information for the gui
function participantInfoGui(participant, participantToggle) {
  participantNameInGui(participant, participantToggle);
  participantContributionInGui(participant, participantToggle);
  participantExpensesInGui(participant, participantToggle);
  participantOwedInGui(participant, participantToggle);
}


// Display the participant's name in an option element of the select element.
function participantNameInGui(participant, participantToggle) {
  let nameTag = document.createElement("option");
  let name = document.createTextNode(participant.name);
  nameTag.appendChild(name);
  participantToggle.appendChild(nameTag)
}

// Display the participant's total money put in, in an option element of the select element.
function participantContributionInGui(participant, participantToggle) {
  let contributionTag = document.createElement("option");
  let contribution = document.createTextNode("Amount Contributed: " + participant.moneyPutIn.toFormat());
  contributionTag.appendChild(contribution);
  participantToggle.appendChild(contributionTag);
  contributionTag.setAttribute("disabled", "disabled");
}

// Display the participant's expenses, in an option element of the select element.
function participantExpensesInGui(participant, participantToggle) {
  let bills = "Nothing has been paid yet.";
  if (participant.expenses.length >= 1) {
    bills = "Expenses Paid: " + participant.expenses[0].expense + "- " + participant.expenses[0].paid.toFormat();
    if (participant.expenses.length > 1) {
      for (let i = 1; i < participant.expenses.length; i++) {
        bills = bills.concat(", " + participant.expenses[i].expense + "- " + participant.expenses[i].paid.toFormat());
      }
    }
  }
  let billsPaid = document.createTextNode(bills);
  let expenseTag = document.createElement("option");
  expenseTag.appendChild(billsPaid);
  participantToggle.appendChild(expenseTag);
  expenseTag.setAttribute("disabled", "disabled");
}

// Display what the participant owes, in an option element of the select element.
function participantOwedInGui(participant, participantToggle) {
  let debts = "Nothing is owed.";
  if (participant.owed.length >= 1) {
    debts = "Money owed: " + participant.owed[0].owedTo + " " + participant.owed[0].owed.toFormat();
    if (participant.owed.length > 1) {
      for (let i = 1; i < participant.owed.length; i++) {
        debts = debts.concat(", " + participant.owed[i].owedTo + " " + participant.owed[i].owed.toFormat());
      }
    }
  }
  let debtsOwed = document.createTextNode(debts);
  let owedTag = document.createElement("option");
  owedTag.appendChild(debtsOwed);
  participantToggle.appendChild(owedTag);
  owedTag.setAttribute("disabled", "disabled");
}

//Update the total expediture in the gui.
function totalExpeditureInGui(participants) {
  let totalExpediture;
  if (!participants) {
    totalExpediture = "Total Expediture: €0.00"
  } else {
    totalExpediture = "Total Expediture: " + totalAmount(participants).toFormat();
  }
  let expeditureNode = document.getElementById("total-expediture");
  expeditureNode.innerHTML = totalExpediture;
}


//Delete a participant.
function deleteParticipant() {
  let inserted = document.getElementById("delete-name");
  let person = inserted.value;
  let isParticipant = false;
  for (let i = 0; i < participants.length; i++) {
    if (person == participants[i].name) {
      let toggle = document.getElementById(participants[i].name);
      toggle.remove();
      participants.splice(i, 1);
      isParticipant = true;
      break
    }
  }
  if (!isParticipant) {
    alert("Please enter a valid participant name.");
  }
  inserted.value = "";
  debugger;
  if (!participants) {
    totalExpeditureInGui(participants);
  } else {
    computeDebts(participants);
    globalUpdateGui(participants);
  }
}


//Delete an expense.
function deleteExpense() {
  let person = document.getElementById("expense-delete-participant");
  let expenseName = document.getElementById("expense-delete");
  let isParticipant = false;
  let isExpense = false;
  if (!person.value) {
    alert("Please enter a participant's name.");
  } else if (!expenseName.value) {
    alert("Please enter an expense.");
  } else {
    for (let i = 0; i < participants.length; i++) {
      if (person.value == participants[i].name) {
        isParticipant = true;
        for (let j = 0; j < participants[i].expenses.length; j++) {
          if (expenseName.value == participants[i].expenses[j].expense) {
            participants[i].moneyPutIn = participants[i].moneyPutIn.subtract(participants[i].expenses[j].paid);
            participants[i].expenses.splice(j, 1);
            isExpense = true;
            break
          }
        }
      }
    }
    if (!isParticipant) {
      alert("Please enter a valid participant name.");
    } else if (!isExpense) {
      alert("Please enter a valid expense name.");
    }
    person.value = "";
    expenseName.value = ""
    computeDebts(participants);
    globalUpdateGui(participants);
  }
}




/*
var nameForm = document.getElementById("name-form");
nameForm.addEventListener("keydown", keyEnterName);

function keyEnterName(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    nameButton.click();
    return false;
  }
}
*/

/*
var deleteForm = document.getElementById("delete-form");
deleteForm.addEventListener("keydown", keyDeleteParticipant);

function keyDeleteParticipant(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    deleteButton.click();
    return false;
  }
}
*/

/*
var deleteExpenseForm = document.getElementById("delete-expense-form");
deleteExpenseForm.addEventListener("keydown", keyDeleteExpense);

function keyDeleteExpense(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    deleteExpenseButton.click();
    return false;
  }
}
*/

/*
var expenseForm = document.getElementById("expense-form");
expenseForm.addEventListener("keydown", keyEnterExpense);

function keyEnterExpense(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    expenseButton.click();
    return false;
  }
}
*/

/*
// Initialize the total expediture.
var totalExpediture = "Total Expediture: €0.00"
var expeditureNode = document.getElementById("total-expediture");
expeditureNode.innerHTML = totalExpediture;
*/