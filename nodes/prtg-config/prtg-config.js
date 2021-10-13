module.exports = function (RED) {
  function RemoteServerNode(config) {
    RED.nodes.createNode(this, config);
    this.host = config.host.replace('https://','').replace('http://','');
    this.port = config.port;
    this.usetls = config.usetls;
    this.followredirect = config.followredirect;
    this.ignoreUnsafeEndpoints = config.ignoreUnsafeEndpoints;
  }
  RED.nodes.registerType("prtg-config", RemoteServerNode);
}
