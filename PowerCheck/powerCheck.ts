
const os = require('os');
const events = require('events'); 
import { SMTPClient } from 'emailjs';
import Server from './Server';
import Config from './Config';

const config:Config = require('./config.json');

var power = {acPower:null, lastChange:null, changes:[]}

var server = new Server(8732, config, (req, res) => {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(power));
});

server.start();

console.log('powerCheck started at ' + new Date())

setInterval(() => {
    var ifaces = os.networkInterfaces();
    var ethFound = false;

    for (var name in ifaces) {
        if (name == config.ethernetName) {

            ifaces[name].forEach(iface => {
                if (iface.family == 'IPv4' && !iface.internal) {
                    ethFound = true;
                }
            })
        }
    }

    if (power.acPower == null) {
        console.log('network ' + config.ethernetName + (ethFound ? ' found' : ' not found'));
        power.acPower = ethFound;
    }

    if (power.acPower != ethFound) {
        power.acPower = ethFound;
        power.lastChange = new Date();
        powerEvent();
    }


     
}, 1000);

function powerEvent() {
    var msg = (power.acPower ? 'AC power restored at ' : 'AC power lost at ') + power.lastChange;    
    power.changes.push(msg);
    sendEmail(msg);
}

function sendEmail(msg) {
    try { 
        const client = new SMTPClient({       
            user: config.smtpUser,
            password: config.smtpPswd,    
            host: config.smtpServer,
            ssl: true,
        }); 

        var message = {
            text: msg,
            from: config.emailFrom,
            to: config.emailTo,
            subject: 'AC Power Event'
        }
         

        client.send(message, (err, msg) => {
            console.log(err || msg);
        });
    }
    catch (e) {
        console.log('sendEmail ' + e);
    }
}


