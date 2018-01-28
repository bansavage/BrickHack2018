/*
   Copyright 2018 Connor Dimaio & Kyle Bansavage

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
//require('./node_modules/chartist-plugin-legend/chartist-plugin-legend.js');
//create some important vars
var chart;
var authKey = "Bearer ";
var subKey = "7a2da79699e74dd0af5b8158f6134fbd";

var BeerVelocities = {}; // Score for each beer type
var StoreNames = []; // The names of stores seen
var BeerSkus = []; // The Skus of beers seen
var StoreNum = [];
/*
325152 //rolling rock
127425 //miller high life
129182//miller lite
90185 //genny cream ale
232673 //keystone light
282162 //labat blue
173308 //pbr
274681 //natty light
166446 //budweiser
*/

$('html').css('cursor','progress');
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
    //console.log(authKey);
  });
  $('html').css('cursor','auto');
});

//on click change btn to grey
$(".logo").click(function() {
  $(this).css("filter","grayscale(1)");
  //change text here
});

async function run(beerID){

  switch (beerID) {
    case 112985: //bud
      $('#budkey').text(BeerSkus.length+1);
      break;
    case 90188:
      $('#coorskey').text(BeerSkus.length+1);
      break;
    case 237942:
      $('#gennykey').text(BeerSkus.length+1);
      break;
    case 127425:
      $('#millerkey').text(BeerSkus.length+1);
      break;
    case 325152:
      $('#rollingkey').text(BeerSkus.length+1);
      break;
    case 173308:
      $('#pbrkey').text(BeerSkus.length+1);
      break;
  }

  var zoneName = document.getElementById("zoneName").value;
  //console.log(zoneName);
  //console.log("Store Length" + StoreNum.length);
  if(StoreNum.length > 0 && !BeerSkus.includes(beerID)) {
      BeerSkus.push(beerID);

      for(var num in StoreNum) {
          //console.log(StoreNum[num]);
          getAvailabilityAtStore(StoreNum[num], beerID);
      }
  }

  else if( StoreNum.length == 0 && !BeerSkus.includes(beerID)) {
    BeerSkus.push(beerID);
    //console.log("BEER SKUS: " + BeerSkus.length);
    await sleep(500);

    $.ajax({
      url: "https://wegmans-es.azure-api.net/locationpublic/location/stores?zoneName=" + zoneName,
      //url: "https://wegmans-es.azure-api.net/productpublic/productavailability/700632/stores",
      beforeSend: setHeaders,
      type: "GET",
      // Request body
      data: "{body}"
    })
      .done(async function(data) {
        for(i = 0; i < data.length; i++) {
          //console.log(data[i].Name);

          if(!StoreNames.includes(data[i].Name)) {StoreNames.push(data[i].Name) }; //adds store names
          if(!StoreNum.includes(data[i].StoreNumber)) StoreNum.push(data[i].StoreNumber);
          getAvailabilityAtStore(data[i].StoreNumber, beerID);
        }
      })
      .fail(function() {
        console.log("error");
      });
  }

  console.log(BeerVelocities);
  //console.log("names"); console.log(StoreNames);
  console.log(BeerSkus);
  console.log(StoreNum);


//      graphResults(BeerVelocities);

}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      if(BeerVelocities[beerID] == null) BeerVelocities[beerID] = [];

      BeerVelocities[beerID].push(availability[0].Velocity);
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
  BeerVelocities = {};
  StoreNames = [];
  BeerSkus = [];
  StoreNum = [];
  //console.log("DATA CLEARED!")
  var event = new Event("DOMContentLoaded");
  document.dispatchEvent(event);
  $(".logo").css("filter","grayscale(0)");
}

document.addEventListener('DOMContentLoaded',function(){
  //console.log(StoreNames);
  console.log(BeerVelocities);
  velocities = [];
    for (key in BeerVelocities) {
        velocities.push(BeerVelocities[key]);
    }


    var data = {
    labels: StoreNames,
    series: velocities
    };

    var options = {
       seriesBarDistance: 10,
       horizontalBars: true,
       AxisY: 50,

    };

    var responsiveOptions = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 15,
        axisX: {
        labelInterpolationFnc: function (value) {
          return value[0];
        }
        }
      }]
    ];

new Chartist.Bar('.ct-chart', data, options, responsiveOptions);

});