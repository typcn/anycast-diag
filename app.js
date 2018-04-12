const ipip = require('./ipip.js');

try{
    ipip.load('/usr/share/IPIP/17monipdb.datx');
}catch(e){
    ipip.load('/usr/local/share/17monipdb.datx');
}

const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
 
let c = new Cap();
let device = process.argv[2];
let filter = 'dst host ' + process.argv[3];
let bufSize = 10 * 1024 * 1024;
let buffer = Buffer.alloc(65535);

let code = process.argv[4];

let linkType = c.open(device, filter, bufSize, buffer);
 
c.setMinBytes && c.setMinBytes(0);
 
c.on('packet', function(nbytes, trunc) {
  if (linkType === 'ETHERNET') {
    var ret = decoders.Ethernet(buffer);
 
    if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
      ret = decoders.IPV4(buffer, ret.offset);
      let addr = ret.info.srcaddr;
      let info = ipip.findSync(addr);
      if(code != info[11] && code != info[12]){
      	console.log('IP:',addr,' ISP:',info[4],', LOC:',info[11],info[12]);
      }
    } else
      console.log('Unsupported Ethertype: ' + PROTOCOL.ETHERNET[ret.info.type]);
  }
});