
//create some important vars
var chart;
var authKey = "Bearer ";
var subKey = "7a2da79699e74dd0af5b8158f6134fbd";

$( document ).ready(function() {

  //get keys for weggies api
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://login.microsoftonline.com/1318d57f-757b-45b3-b1b0-9b3c3842774f/oauth2/token",
    "method": "POST",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache"
    },
    "data": {
      "client_id": "24960d97-4fbe-433d-ab8a-efeb89aa524e",
      "grant_type": "client_credentials",
      "resource": "https://wegmans-es.azure-api.net",
      "client_secret": "A8N7VeeCdFD5N4OxeQT1gFaXNStrxieEplYl3SYdxTs="
    }
  };

  $.ajax(settings).done(function (response) {
    authKey += response.access_token;
    console.log(authKey);
  });
});

//attach 'enter' key to button
$("#zoneName").keyup(function(event) {
  if (event.keyCode === 13) {
    $("#submit").click();
  }
});

var BeerVelocities = [ [], [], [] ]; // Score for each beer type
var StoreNames = []; // The names of stores seen
var BeerSkus = []; // The Skus of beers seen


function run(beerID){
  var zoneName = document.getElementById("zoneName").value;
  //console.log(zoneName);

  if( !BeerSkus.includes(beerID)) {
    BeerSkus.push(beerID);
    //console.log("BEER SKUS: " + BeerSkus.length);

    var promise = $.ajax({
      url: "https://wegmans-es.azure-api.net/locationpublic/location/stores?zoneName=" + zoneName,
      //url: "https://wegmans-es.azure-api.net/productpublic/productavailability/700632/stores",
      beforeSend: setHeaders,
      type: "GET",
      // Request body
      data: "{body}"
    })
      .done(function(data) {
        for(i = 0; i < data.length; i++) {
          console.log(data[i].Name);

          if(!StoreNames.includes(data[i].Name)) StoreNames.push(data[i].Name); //adds store names
          getAvailabilityAtStore(data[i].StoreNumber, beerID);
        }
      })
      .fail(function() {
        console.log("error");
      });
  }

  console.log(BeerVelocities);
  console.log(StoreNames);
  console.log(BeerSkus);


//      graphResults(BeerVelocities);

}

function getAvailabilityAtStore(storeNum,beerID) {
  $.ajax({
    url: "https://wegmans-es.azure-api.net/productpublic/productavailability/" + beerID + "/" + storeNum,
    //url: "https://wegmans-es.azure-api.net/productpublic/productavailability/700632/stores",
    beforeSend: setHeaders,
    type: "GET",
    // Request body
    data: "{body}"
  })
    .done(function(availability) {
      //console.log("availability");
      BeerVelocities[BeerSkus.length - 1].push(availability[0].Velocity);
      var event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);
      //console.log(BeerVelocities);

    })
    .fail(function() {
      console.log("error");
    });

}

function setHeaders(xhrObj) {
  xhrObj.setRequestHeader("Location-Subscription-Key", subKey);
  xhrObj.setRequestHeader("Product-Subscription-Key",subKey);
  xhrObj.setRequestHeader("Authorization",authKey);
  xhrObj.setRequestHeader("Availability-Subscription-Key", subKey);
}

function zoneChanged() {
  BeerVelocities = [ [], [], [] ];
  StoreNames = [];
  BeerSkus = [];
}

document.addEventListener('DOMContentLoaded',function(){
  //console.log(StoreNames);
  console.log(BeerVelocities);

  chart = new Chartist.Bar('.ct-chart', {
    labels: StoreNames,
    series: [
      BeerVelocities[0],
      BeerVelocities[1],
      BeerVelocities[2]
    ]
  }, {
    seriesBarDistance: 20,
    reverseData: true,
    horizontalBars: true,
    axisY: {
      offset: 50
    }
  });
});