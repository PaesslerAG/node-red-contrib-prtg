module.exports = function (RED) {
    function prtg_push(config) {
        
        var mustache = require("mustache");
        RED.nodes.createNode(this, config);
        var node = this;
        
        var configNode = RED.nodes.getNode(config.server)
        var http = require(configNode.usetls?'https':'http')
        
        function getNested (theObject, path, separator) {
            try {
                separator = separator || '.';
                return path.replace('[', separator).replace(']','')
                            .split(separator)
                            .reduce(
                                function (obj, property) { 
                                    return obj[property];
                                }, theObject || self
                            );
                            
            } catch (err) {
                return undefined;
            }   
        }

        var sendToPRTG=function(results, messageText){
            var outObj = {
                "prtg": {
                    "result": results,
                    "text":  messageText || "Last update: "+(new Date()).toISOString()
                }
            }
            var post_data = JSON.stringify(outObj)

            node.log('\npost_data:\t' + post_data + '\n'); 

            var post_options = {
                host: configNode.host,
                port: configNode.port,
                timeout: Number(config.timeout), 
                followRedirect: configNode.followredirect, 
                path: '/'+config.idtoken,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(post_data)
                }
            };

            if (configNode.usetls && configNode.ignoreUnsafeEndpoints) {
                post_options.rejectUnauthorized = false
            }

            try { 
                var post_req = http.request(post_options, function(res) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        node.log('Response: ' + chunk);
                    });
                });
                post_req.on('error',function(reqError){
                    node.log('Error sending Data to PRTG: ' + reqError); 
                    node.status({fill:"red",shape:"ring",text:'Error sending Data to PRTG: '+reqError}); 
                    node.error('Error sending Data to PRTG on: '+configNode.host+':'+configNode.port,reqError)   
                })
                post_req.on('timeout',function(reqError){
                    node.log('Sending Data to PRTG ran into a timeout: ' + reqError); 
                    node.status({fill:"red",shape:"ring",text:'Error sending Data to PRTG: '+reqError}); 
                    node.error('Sending Data to PRTG ran into a timeout: '+configNode.host+':'+configNode.port,reqError)   
                })
                post_req.write(post_data);
                post_req.end();
                node.status({fill:"green",shape:"dot",text:"Send PRTG-Msg"});
                node.send ({
                    payload:{
                        info: 'All required inputs completed. Sending PRTG-Msg to: '+configNode.host+':'+configNode.port,
                        data: outObj
                    }
                })
            } catch (e) {
                node.log('Error sending Data to PRTG: ' + e); 
                node.status({fill:"red",shape:"ring",text:'Error sending Data to PRTG: '+e}); 
                node.error('Error sending Data to PRTG on: '+configNode.host+':'+configNode.port,msg)
            }
        }

        node.on('input', function (msg) {
            dataContainer = []
            for(let channelKey in config.channels) {
                let channel = config.channels[channelKey]
                node.log('\tchannelKey\t->\t' + JSON.stringify(channelKey))
                node.log('\tchannel\t\t->\t' + JSON.stringify(channel.channel))
                node.log('\tchanneltype\t\t->\t' + JSON.stringify(channel.channeltype))
                node.log('\tunittype\t\t->\t' + JSON.stringify(channel.unittype))
                node.log('\tunit\t\t->\t' + JSON.stringify(channel.unit))                

                let resolvedChannelName
                if (channel.channeltype == "msg")
                    resolvedChannelName = getNested(msg,channel.channel)
                else
                    resolvedChannelName = channel.channel

                let resolvedUnit    
                if (channel.unittype == "msg")
                    resolvedUnit = getNested(msg,channel.unit)
                else
                    resolvedUnit = channel.unit 

                node.log('\tresolvedUnit :\t\t->\t' + resolvedUnit);    
                node.log('\tresolvedChannelName\t->\t' + JSON.stringify(resolvedChannelName))
                let resolvedValue = getNested(msg, channelKey)
                node.log('\tresolvedValue\t->\t' + JSON.stringify(resolvedValue))
                let resultObj = {
                    channel: resolvedChannelName,
                    value: resolvedValue,
                    float: "1",
                    unit: "custom",
                    customunit: resolvedUnit
                }
                dataContainer.push(resultObj)
                node.log('next...')
            }
            node.log('\t\tsend\t\t->\t' + JSON.stringify(dataContainer))
            let messageText
            if (config.messageType=="str")
                messageText = config.message
            else {
                try {
                    messageText = getNested(msg, config.message)
                } catch (e) {
                    node.log('Message text Error: '+e)
                }
            }
            node.log('messageText:' + messageText)
            node.log('messageType:' + config.messageType)

            oldIdToken = config.idtoken;
            if ((config.idtoken || "").indexOf("{{") != -1) {
                node.log('parsed token-ID from: ' + config.idtoken);
                config.idtoken = mustache.render(config.idtoken, msg);
				node.log('parsed token-ID to new token-ID: ' + config.idtoken);
			}
            sendToPRTG(dataContainer, messageText)
            //reset id to old state:
            config.idtoken  = oldIdToken;
        });
    }

    RED.nodes.registerType("prtg-connector", prtg_push);
}
