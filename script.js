'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////


const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; //kdyz je innerHTML "" nebo null tak se odstrani veskery html

  //sort jelikoz mutuje tak pomoci slice udelame kopii arraye of movements a pak to sortneme
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}"> ${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>`;
    //insertAdjacentHTML pro tvorbu elementu v JS
    containerMovements.insertAdjacentHTML('afterbegin', html); //afterbegin aby se to zobrazovalo az po parent elementu 
  });
};

//Vypocet a display balancu (sectu vsechny hodnoty)
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

//Display kladnych hodnot (deposites)
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  //a tady zaporne (withdrawls)
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  //Tady interest
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    //tady to je proto ze chceme aby to pridalo kdyz je interest z depositu alespon 1eur
    .filter(int => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

// chceme aby to bylo STW
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);

  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};

//LOGOUT TIMER
const startLogoutTimer = function () {
  const tick = function () {
    const minutes = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);
    // in each call, print time to UI
    labelTimer.textContent = `${minutes}:${seconds}`;

    //when timer is 0 stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    //decrease time 1s
    time--;
  };
  //set time to 5mins
  let time = 100;
  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//Event handler
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  //prevents to reload the page after clicking to login
  e.preventDefault();

  //pomoci find hledame jestli value se shoduje s account username
  //currentAccount pote co se shoduje tak se do nej ulozi cely objekt tohoto accountu
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display Ui and a welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0] //Jonas
    }`;
    containerApp.style.opacity = 100; 

    //Internalization of date
    const today = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    

    labelDate.textContent = Intl.DateTimeFormat('en-US', options).format(today); 
    inputLoginPin.value = '';
    inputLoginUsername.value = '';
    inputLoginPin.blur(); 

    //timer ( if timer is true (neboli kdyz bezi uz z jineho uctu tak) smazat timer a nacist znovu)
    if (timer) clearInterval(timer); //pro prepnuti na jiny ucet -> smazat timer
    timer = startLogoutTimer(); //nacteme timer znovu
    //Update UI
    updateUI(currentAccount);
  }
});

//Transfer Money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); 
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  console.log(amount, receiverAcc);

  //smaze hodnoty transferu ve formu
  inputTransferTo.value = '';
  inputTransferAmount.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username // jestli receiverAcc.username existuje(?) tak nesmi byt stejna jako current username
  ) {
    //Tady se deje transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Update UI
    updateUI(currentAccount);

    //Reset the timer kdyz je uzivatel aktivni
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

//Loan - request must be 10% of the deposite
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);

  //Podminka jestli splni tak pridame movement(loan)
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //po 2,5sek se prida loan
    setTimeout(function () {
      //add movement
      currentAccount.movements.push(amount);

      //Update UI
      updateUI(currentAccount);

      //Reset the timer kdyz je uzivatel aktivni
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //Delete account with index ...
    accounts.splice(index, 1);
    // zmenime opacity na 0 jako log out
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

//BTN SORT
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted; //tady kdyby jsme to nemeli tak by se to sortlo jen jednou a pak by to nefungovalo takze kdyz je to true tak to bude false a naopak
});
//Array.from()
/*
labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementsUI);
});
*/
