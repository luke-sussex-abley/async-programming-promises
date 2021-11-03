import setText, { appendText, showWaiting, hideWaiting } from "./results.mjs";

// example on how to handle a fulfilled promise
export function get() {
  axios.get("http://localhost:3000/orders/1").then(({ data }) => {
    setText(JSON.stringify(data));
  });
}

// example on how to handle a rejected promise
export function getCatch() {
  axios
    .get("http://localhost:3000/orders/123456789")
    .then((result) => {
      if (result.status === 200) {
        setText(JSON.stringify(result.data));
      } else {
        setText("Error"); // this will never execute because the .then() function is only executed if the promise is fulfilled
      }
    })
    .catch((err) => setText(err)); // if the promise is rejected (i.e. some type of error), run the .catch() function which takes in a reason for why the promise failed
}

// chain two promises together
export function chain() {
  axios
    .get("http://localhost:3000/orders/1")
    .then(({ data }) => {
      return axios.get(
        `http://localhost:3000/addresses/${data.shippingAddress}`
      );
    })
    .then(({ data }) => {
      setText(`City: ${data.city}`);
    });
}

//
export function chainCatch() {
  axios
    .get("http://localhost:3000/orders/1")
    .then(({ data }) => {
      return axios.get(
        `http://localhost:3000/addresses/${data.shippingAddress}`
      );
    })
    .then(({ data }) => {
      setText(`City: ${data.my.city}`); // intentionally cause error. (use data.city for no error)
    })
    .catch((err) => setText(err));
}

export function final() {
  showWaiting();
  axios
    .get("http://localhost:3000/orders/1")
    .then(({ data }) => {
      return axios.get(
        `http://localhost:3000/addresses/${data.shippingAddress}`
      );
    })
    .then(({ data }) => {
      setText(`City: ${data.city}`);
    })
    .catch((err) => setText(err))
    .finally(() => {
      setTimeout(() => {
        hideWaiting();
      }, 1500);
      appendText(" -- Completely done");
    });
}
