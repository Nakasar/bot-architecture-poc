let commands = {
  'thanks': {
    cmd: 'thanks',
    execute: sayThanks,
    expected_args: []
  },
  'greets': {
    cmd: 'greets',
    execute: sayHello,
    expected_args: []
  }
};
let intents = {
  'greetings-say-hello': {
    slug: 'say-hello',
    handle: handleHello,
    expected_entities: []
  },
  'greetings-say-thank': {
    slug: 'say-thanks',
    handle: handleThanks,
    expected_entities: []
  }
};
let dependencies = [];

exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

function sayThanks() {
  return new Promise((resolve, reject) => {
    return resolve({
      message: "It's nothing my dear friend :)"
    })
  })
}

function sayHello() {
  return new Promise((resolve, reject) => {
    return resolve({
      message: "Hello o/"
    });
  });
}

function handleHello() {
  return sayHello();
}

function handleThanks() {
  return sayThanks();
}
