'use strict';
var Connector = require("../models/connectorModel");

module.exports.create_connector = function(name, ip = "") {
  return new Promise((resolve, reject) => {

    let new_connector = new Connector();
    new_connector.name = name;
    new_connector.active = true;
    if (ip) {
      new_connector.ip = ip;
    }
    let token = Math.random().toString(16).substring(2,) + Date.now().toString(16) + Math.random().toString(16).substring(2,);
    while(Object.values(connectors).filter((connector) => token === connector.token).length > 0) {
      token = Math.random().toString(16).substring(2,) + Date.now().toString(16) + Math.random().toString(16).substring(2,);
    }
    new_connector.token = token;

    connectors[new_connector._id] = new_connector;

    return resolve(new_connector)
  });
};

module.exports.toggleConnector = function(id, status) {
  return new Promise((resolve, reject) => {
    if (connectors[id]) {
      connectors[id].active = status === "active" ? true : false;
      let { _id, active, name } = connectors[id];
      resolve({ _id, active, name });
    } else {
      reject({
        code: 404,
        message: "No connector with id " + id
      })
    }
  });
};

module.exports.checkConnectorToken = function(token) {
  return new Promise((resolve, reject) => {
    let fetched = Object.values(connectors).filter((connector) => token === connector.token);
    if (fetched.length == 1) {
      resolve(fetched[0]);
    } else {
      resolve(null);
    }
  });
};

module.exports.getConnectors = function() {
  return new Promise((resolve, reject) => {
    let fetched = Object.values(connectors).map((connector) => {
      let { name, _id, active } = connector
      return { name, _id, active };
    });
    resolve(fetched);
  });
};

module.exports.getConnector = function(id) {
  return new Promise((resolve, reject) => {
    if (connectors[id]) {
      resolve(connectors[id]);
    } else {
      reject({
        code: 404,
        message: "No connector with id " + id
      })
    }
  });
}

module.exports.regenerateConnectorToken = function(id) {
  return new Promise((resolve, reject) => {
    if (connectors[id]) {
      let token = Math.random().toString(16).substring(2,) + Date.now().toString(16) + Math.random().toString(16).substring(2,);
      while(Object.values(connectors).filter((connector) => token === connector.token).length > 0) {
        token = Math.random().toString(16).substring(2,) + Date.now().toString(16) + Math.random().toString(16).substring(2,);
      }
      connectors[id].token = token;
      resolve(connectors[id]);
    } else {
      reject({
        code: 404,
        message: "No connector with id " + id
      })
    }
  });
};

module.exports.delete_connector = function(id) {
  return new Promise((resolve, reject) => {
    if (!connectors[id]) {
      return reject({
        code: 404,
        message: "No connector with id " + id
      })
    }

    try {
      delete connectors[id];
      return resolve();
    } catch(e) {
      return reject(e);
    }
  });
};

module.exports.update_connector = function(id, { ip: newip, name: newname }) {
  return new Promise((resolve, reject) => {
    if (connectors[id]) {
      if (newip) {
        connectors[id].ip = newip;
      }
      if (newname) {
        connectors[id].name = newname;
      }
      let { _id, active, name, ip } = connectors[id];

      resolve({ _id, active, name, ip });
    } else {
      reject({
        code: 404,
        message: "No connector with id " + id
      })
    }
  });
};

//////////////////////////////////////////////////////
// TODO : SWITCH TO CONSISTENT STORAGE (OR NOT)
//////////////////////////////////////////////////////
let connectors = {};
let c1 = new Connector();
c1.name = "RocketChat Intech";
c1.token = "59az4dazdaz4d86az4dazd";
c1.active = true;
connectors[c1._id] = c1;


let c2 = new Connector();
c2.name = "Dashboard";
c2.token = "fjkaz5h65g48az8dAHJKZDe";
c2.active = true;
connectors[c2._id] = c2;
