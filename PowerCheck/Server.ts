const http = require('http');
import Config from './Config';

export default class Server {    
    server: any;   
    port: number;
    config: Config;
    receiveCb: any;
    constructor(port: number,config:Config,receiveCb) {
        this.port = port;
        this.config = config;
        this.receiveCb = receiveCb;
    }

    start() {
        this.server = http.createServer((req,res)=> {this.requestReceived(req,res)});            
        this.server.listen(this.port);
        console.log('web server listening ' + this.port);       
    }

    requestReceived (req, res) {       

        var allowOrigin = this.config.allowOrigins.find(origin => {
            return origin.includes(req.headers.origin);
        });

        try {  

            if (allowOrigin)
                res.setHeader('Access-Control-Allow-Origin', allowOrigin);          
            
            if (req.method == 'GET') {
                this.receiveCb(req, res);
            }

            if (req.method == 'OPTIONS') {
                res.statusCode = 200;
                res.end();
            }     
           
        }
        catch (e) {
            console.log('requestReceived ' + e);
            res.statusCode = 500;
            res.end('app error');
        }
         
        
    
    }

}