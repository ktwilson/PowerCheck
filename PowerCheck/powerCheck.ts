
const os = require('os');
const events = require('events'); 
const emailjs = require('emailjs');
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
    console.log(msg);
    power.changes.push(msg);
    sendEmail(msg);
}

function sendEmail(msg) {
    try {

        var mailsrv = emailjs.server.connect({
            host: config.smtpServer,
            ssl: false
        });

        var message = {
            text: msg,
            from: config.emailFrom,
            to: config.emailTo,
            subject: 'AC Power Event'
        }
         

        mailsrv.send(message, (err, msg) => {
            //console.log(err || msg);
        });
    }
    catch (e) {
        console.log('sendEmail ' + e);
    }
}


