module.exports = function (RED) {
  function RemoteServerNode(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host.replace('https://','').replace('http://','');
    this.port = n.port;
    this.usetls = n.usetls;
    this.followredirect = n.followredirect;
    this.ignoreUnsafeEndpoints = n.ignoreUnsafeEndpoints;
  }
  RED.nodes.registerType("prtg-config", RemoteServerNode);
}
