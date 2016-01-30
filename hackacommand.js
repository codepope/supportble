var noble = require('noble');
var stringify = require('json-stringify')
var repl = require('repl')
var bands={}

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    console.log("Starting scan")
    noble.startScanning(["FFF0"]);
  } else {
    console.log("Stopping Scan")
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {

  localName=peripheral.advertisement.localName

  if(localName == undefined) {
    console.log("Discarded "+peripheral);
    return;
  }
    if (localName.startsWith("WearFit ")) {
      wfitnum=localName.substring(8);
      bands[wfitnum]={ wfitname: localName, num:wfitnum, peripheral:peripheral };
      digBand(wfitnum,peripheral);
      //console.log(bands)
    }
});

function crcBuffer(bytes) {
    c=(bytes[0]+bytes[1]+bytes[2]+bytes[3]+bytes[4]+bytes[5]+bytes[6]+bytes[7]+bytes[8]+bytes[9]+bytes[10]+bytes[11]+bytes[12]+bytes[13]+bytes[14])&0xFF
    bytes.push(c)
    return Buffer(bytes)
}

rxuuid="fff7"
txuuid="fff6"

function digBand(wfitnum,peripheral) {
  peripheral.on('disconnect', function() {
    console.log("Disconnected")
    //process.exit(0);
  });

  // console.log(stringify(peripheral,null,2))
  console.log("We got the band together - " + peripheral.id);
  peripheral.connect((error) => {
    serviceUUIDs=[ "fff0" ];
    characteristicUUIDs=[ rxuuid, txuuid ]
    peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
      characteristics.forEach((characteristic)=>{
        console.log(characteristic.uuid)
        if(characteristic.uuid == rxuuid) {
          bands[wfitnum].rx=characteristic;
          console.log("Got RX")
        } else if(characteristic.uuid == txuuid) {
          bands[wfitnum].tx = characteristic;
          console.log("Got TX")
        }
      });

      bands[wfitnum].services=services;
      console.log(bands[wfitnum].rx);
      b=crcBuffer([0x41,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
      bands[wfitnum].tx.write(b,true,(error) => {
        console.log(error);
        bands[wfitnum].rx.read((error,data) => {
          console.log(error)
          console.log(data)
        });
      })
      console.log(b);
    });
  });
};

repl.start("$$>").context.bands=bands;
