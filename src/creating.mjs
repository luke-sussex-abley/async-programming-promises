import setText, { appendText } from "./results.mjs";

export function timeout() {
  const wait = new Promise((resolve) => {
    console.log("in func");
    // setTimeout will only call its internal function one time when the timer expires
    setTimeout(() => {
      resolve("Timeout!"); // call resolve() and set the state to fulfilled
      console.log("in set timeout");
    }, 2000);
  }); // new promise in the 'pending' state

  wait.then((text) => setText(text));
}

export function interval() {
  let counter = 0;
  const wait = new Promise((resolve) => {
    // setInterval will call its internal function multiple times, each after the time expries
    setInterval(() => {
      console.log("INTERVAL");
      resolve(`Timeout! ${++counter}`); // call resolve() and set the state to fulfilled
    }, 1500);
  }); // new promise in the 'pending' state

  wait
    .then((text) => setText(text))
    .finally(() => appendText(` -- Done ${counter}`));
}

export function clearIntervalChain() {
  let counter = 0;
  let interval;
  const wait = new Promise((resolve) => {
    interval = setInterval(() => {
      console.log("INTERVAL");
      resolve(`Timeout! ${++counter}`);
    }, 1500);
  });

  wait.then((text) => setText(text)).finally(() => clearInterval(interval));
}

// multiple reject statements, this is because there were multiple reasons why the call might fail
export function xhr() {
  let request = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/users/7");
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = () => reject("Request Failed");
    xhr.send();
  });

  request.then((result) => setText(result)).catch((reason) => setText(reason));
}

export function allPromises() {
  // axios is built using promises which means each of the variables below is a promise
  let categories = axios.get("http://localhost:3000/itemCategories");
  let statuses = axios.get("http://localhost:3000/orderStatuses");
  let userTypes = axios.get("http://localhost:3000/userTypes");
  let addressTypes = axios.get("http://localhost:3000/addressTypes"); // this call will fail

  // we want to wait for all three of these promises to be fulfilled but we don't know which order the api will return them in
  // use Promise.all to queue up all three promises and wait until all three return

  // Promise.all returns the results object as part of an array
  // The .all() function will wait until either all promises are fulfilled or until the first promise is rejected.
  Promise.all([categories, statuses, userTypes, addressTypes])
    // the result value in the then() function is simply an array of results. The order must match the order we added them (not the order they were resolved (which we dont know))
    .then(([cat, stat, type, address]) => {
      setText("");

      // use .data on the axios object to see the data
      appendText(JSON.stringify(cat.data));
      appendText(JSON.stringify(stat.data));
      appendText(JSON.stringify(type.data));
      appendText(JSON.stringify(address.data));
    })
    .catch((reasons) => {
      setText(reasons);
    });
}

export function allSettled() {
  let categories = axios.get("http://localhost:3000/itemCategories");
  let statuses = axios.get("http://localhost:3000/orderStatuses");
  let userTypes = axios.get("http://localhost:3000/userTypes");
  let addressTypes = axios.get("http://localhost:3000/addressTypes");

  // allSettled will resolve with an array of data, including rejected promises. this means we do not need a catch function (it is still recommended to catch any other errors that occur in the then() block)
  // 2 keys, status will either be fulfilled or rejected. and then the second key will either be value (if status is fulfilled) and have the data of the response OR reason (if the status is rejected) and have the data with the reason for the rejection
  Promise.allSettled([categories, statuses, userTypes, addressTypes])
    .then((values) => {
      let results = values.map((v) => {
        if (v.status === "fulfilled") {
          return `FULFILLED: ${JSON.stringify(v.value.data[0])} `;
        }

        return `REJECTED: ${v.reason.message}  `;
      });

      setText(results);
    })
    .catch((reasons) => {
      setText(reasons);
    });
}

// get data from the fastest API endpoint and ignore all other data
export function race() {
  let users = axios.get("http://localhost:3000/users");
  let backup = axios.get("http://localhost:3001/users");

  // fire off both requests but we only want the results of the first response that settles (finishes)
  // this will return with the single first promise that settles
  Promise.race([users, backup])
    .then((users) => setText(JSON.stringify(users.data)))
    .catch((reason) => setText(reason));
}
