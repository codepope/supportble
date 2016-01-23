var noble = require('noble');
var stringify = require('json-stringify')


noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  //console.log(peripheral.advertisement);

  if (peripheral.advertisement.localName === "WearFit F691") {
    digBand(peripheral);
  }
});

function digBand(peripheral) {

  peripheral.on('disconnect', function() {
    process.exit(0);
  });

  // console.log(stringify(peripheral,null,2))
  console.log("We got the band together - " + peripheral.id);
  peripheral.connect((error) => {
    peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
      console.log(error);
      console.log(services);
      console.log(characteristics);
    });
  });
};
