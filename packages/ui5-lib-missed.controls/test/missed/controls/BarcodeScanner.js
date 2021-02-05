sap.ui.define(["missed/controls/BarcodeScanner"], (BarcodeScanner) => {

    new BarcodeScanner({
        text: "Hallo Volker!"
    }).placeAt("content");

});
