# node-red-contrib-prtg
node-red nodes to interact with PRTG Network Monitor

## Install:
    npm i git+https://github.com/PaesslerAG/node-red-contrib-prtg.git

## PRTG Nodes:

![prtg-connector Node](docs/prtg-node.png "prtg-connector Node")

The prtg-connector node ingests a msg payload, transforms it to the PRTG Custom Sensor message format and sends an HTTP Post request to the configured PRTG Probe.
The address and ID-Token used for the HTTP Push Based Sensor of your PRTG-Probe needs to be configured.

## Configuration

**Here goes your server and port:**
![prtg node-red node help server port](docs/config-node.png)

**Here you need to add your ID-Token:**
![prtg node-red node help id token](docs/config-prtg-node.png)

**Example of PRTG-Channel-Definition:**
![prtg node-red node help channel definition](docs/channel-definition.png)

    msg.
        The path of your input message
    
    PRTG-Channel
        The name of your Channel in PRTG

    PRTG-Unit
        The custom unit name in PRTG
        (Can be a static string or a placeholder)