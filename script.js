var
  GFTable = "1tzpOQVWrppIM-tHGQTi0vP-fRLLR1H7dKWqLH6XJ"      // ID da tabela no Fusion Tables
, Google_API_key = "AIzaSyCreptOWN3UAF4LdXLNt6XzMuPAbEciJH0" // Chave da API do Google
, Mapbox_API_key = "pk.eyJ1IjoibmlnaHRvIiwiYSI6InY4aDA3clEifQ.Z0L7LrDGCcYA6c1xwOcdCA"
, Mapbox_mapid = "mapbox.streets"
, Mapbox_format = "png"
, initialLatLon = [-22.941,-43.396]
, initialZoomLevel = 10
, mapData // guarda os dados obtidos do Fusion Tables
, map     // instância de mapa do leaflet.
, isYearRangeChanged = false
;

function handleYearChange(year){
  if(isYearRangeChanged){
    processMapData(year);
  }
  isYearRangeChanged = true;
}

function processMapData(year){
  console.log(year, mapData);

  var linesArray = [];

  // começa removendo tudo
  for(var i in map._layers){
    if(map._layers[i]._path !== undefined){
      map.removeLayer(map._layers[i]);
    }
  }

  // para cada linha na tabela
  for(var i=0, l=mapData.rows.length; i<l; i++){
    // se a data de construção for menor que a data em questão
    // e a data de demolição for maior ou não existir
    if(
      parseInt(mapData.rows[i][0]) <= year &&
      (
        mapData.rows[i][1] === 'NaN' ||
        parseInt(mapData.rows[i][1]) > year
      )
    ){
      // se for ferrovia
      if(mapData.rows[i][2] === 'Ferrovia'){
        var
          latLonArray = []
        , popupText = '<b>' + mapData.rows[i][3] + '</b><br>' + mapData.rows[i][4];
        ;

        // link
        if(mapData.rows[i][5]){
          popupText += '<br><br><a target="_blank" href="' + mapData.rows[i][5] + '">LINK</a>'
        }

        // pontos da linha
        for(var j=0, lj=mapData.rows[i][7].geometry.coordinates.length; j<lj; j++){
          var
            lat = mapData.rows[i][7].geometry.coordinates[j][1]
          , lon = mapData.rows[i][7].geometry.coordinates[j][0]
          ;
          latLonArray.push([lat, lon]);
        }

        // colocando no array
        linesArray.push( L.polyline(latLonArray).bindPopup(popupText).addTo(map) );
      }
    }
  }
}

function getGFTData(){
  var
    query = "select * from "+GFTable
  , escapedQuery = query.replace(/ /g, '+')
  , GFT_URL = "https://www.googleapis.com/fusiontables/v1/query?sql="+escapedQuery+"&key="+Google_API_key+"&jsoncallback="
  ;

  console.log('loading map data');

  $.getJSON(GFT_URL, function(data){
      mapData = data;
      processMapData(2015);
  });
}

function createYearRangeInput(){
  slider = L.control.slider(function(value) {
    handleYearChange(value);
  }, {
    id: 'slider'
  , size: '400px'
  , min: 1850
  , max: 2015
  , value: 2015
  }).addTo(map);
}

function initializeMap(){
  //var tileLayerUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
  var tileLayerUrl = 'https://api.mapbox.com/v4/' + Mapbox_mapid + '/{z}/{x}/{y}.' + Mapbox_format + '?access_token=' + Mapbox_API_key;

  map = L.map('map').setView(initialLatLon, initialZoomLevel);

  L.tileLayer(tileLayerUrl, {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  createYearRangeInput();
}

$(document).ready(function(){
    initializeMap();
    getGFTData();
});
