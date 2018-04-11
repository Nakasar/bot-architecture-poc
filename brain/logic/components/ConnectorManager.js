'use strict';

exports.ConnectorManager = class ConnectorManager {
  constructor() {
    this.connectorController = require("./../../database/controllers/connectorController");
  }

  getConnectors() {
    return this.connectorController.getConnectors();
  }

  getConnector(id) {
    return this.connectorController.getConnector(id);
  }

  createConnector(name, ip = "") {
    return this.connectorController.create_connector(name, ip);
  }

  updateConnector(id, update) {
    return this.connectorController.update_connector(id, update);
  }

  deleteConnector(id) {
    return this.connectorController.delete_connector(id);
  }

  regenerateConnectorToken(id) {
    return this.connectorController.regenerateConnectorToken(id);
  };

  checkConnectorToken(token) {
    return this.connectorController.checkConnectorToken(token);
  };

  toggleConnector(id, status) {
    return this.connectorController.toggleConnector(id, status);
  };
}
