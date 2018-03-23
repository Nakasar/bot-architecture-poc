let commands = {
  'thanks': {
    cmd: 'thanks',
    execute: sayThanks,
    expected_args: null
  },
  'greets': {
    cmd: 'greets',
    execute: sayHello,
    expected_args: null
  }
};
let intents = {
  'greetings-say-hello': {
    slug: 'say-hello',
    command: 'greets',
    expected_entities: null
  },
  'greetings-say-thank': {
    slug: 'say-thanks',
    command: 'thanks',
    expected_entities: null
  }
};
let dependencies = [];

exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

function sayThanks() {
  return new Promise((resolve, reject) => {
    return resolve({
      message: "It's nothing ;)"
    })
  })
}

function sayHello() {
  return new Promise((resolve, reject) => {
    return resolve({
      message: "Hello o/"
    })
  })
}
