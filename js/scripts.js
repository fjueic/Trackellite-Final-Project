var tle_line_1 = '1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927'
var tle_line_2 = '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537'
WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
var latitudePlaceholder = document.getElementById('latitude');
var longitudePlaceholder = document.getElementById('longitude');
var altitudePlaceholder = document.getElementById('altitude');
var speed = 10;
// get canvas
var wwd = new WorldWind.WorldWindow("wwd");

// terrrain layer
var terrainLayer = new WorldWind.BMNGLayer();
wwd.addLayer(terrainLayer);
wwd.addLayer(new WorldWind.BingAerialLayer());

wwd.addLayer(new WorldWind.CompassLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

// stars and atomsphere
var starFieldLayer = new WorldWind.StarFieldLayer();
var atmosphereLayer = new WorldWind.AtmosphereLayer("./8k_earth_nightmap.jpg");
wwd.addLayer(starFieldLayer);
wwd.addLayer(atmosphereLayer);

// night mode
var now = new Date();
starFieldLayer.time = now;
atmosphereLayer.time = now;

var normal_time_per_rotation = 24*3600*1000 ; //  orignal speed
var time_per_rotation = 24*3600*1000; // (in milliseconds)
var start_time = Date.now();
// start rotating earth
function runSimulation() {

    var simulatedDays = (Date.now() - start_time) / time_per_rotation;

    var millisPerDay = 24 * 3600 * 1000; // 24 hours/day * 3600 seconds/hour * 1000 milliseconds/second
    var simulatedMillis = simulatedDays * millisPerDay;
    var simulatedDate = new Date(start_time + simulatedMillis);

    starFieldLayer.time = simulatedDate;
    atmosphereLayer.time = simulatedDate;
    wwd.redraw(); // Update the WorldWindow scene.

    requestAnimationFrame(runSimulation);
}

// Animate

requestAnimationFrame(runSimulation);
// if eye altitude is less than 40km, change layer to BingAerialWithLabelsLayer
wwd.addEventListener("mousewheel", function (event) {
    var eyePosition = wwd.navigatorState.eyePoint;
    var eyeAltitude = eyePosition[2];
    if (eyeAltitude < 40000) {
        wwd.removeLayer(wwd.layers[1]);
        wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());
    }
    else {
        wwd.removeLayer(wwd.layers[41]);
        wwd.addLayer(new WorldWind.BMNGLandsatLayer());
    }
});

// Create renderable layer to hold the Collada model.
var modelLayer = new WorldWind.RenderableLayer("ISS");
wwd.addLayer(modelLayer);
var placemarkLayer = new WorldWind.RenderableLayer("Placemarks")
wwd.addLayer(placemarkLayer);




// past and future path of satellite

function getPosition(satrec, time) {
var position_and_velocity = satellite.propagate(satrec,time.getUTCFullYear(),time.getUTCMonth() + 1,time.getUTCDate(),time.getUTCHours(),time.getUTCMinutes(),time.getUTCSeconds());
var position_eci = position_and_velocity["position"];
var gmst = satellite.gstime (time.getUTCFullYear(),time.getUTCMonth() + 1,time.getUTCDate(),time.getUTCHours(),time.getUTCMinutes(),time.getUTCSeconds());

var position_gd = satellite.eciToGeodetic (position_eci, gmst);
var latitude    = satellite.degreesLat(position_gd["latitude"]);
var longitude   = satellite.degreesLong(position_gd["longitude"]);
var altitude    = position_gd["height"] * 1000;

return new WorldWind.Position(latitude, longitude, altitude);
}
function addorbit(){
    var satrec = satellite.twoline2satrec(tle_line_1, tle_line_2);

    var now = new Date();
    var pastOrbit = [];
    var futureOrbit = [];
    var currentPosition = null;
    for(var i = -98; i <= 98; i++) {
    var time = new Date(now.getTime() + i*60000);

    var position = getPosition(satrec, time)

    if(i < 0) {
        pastOrbit.push(position);
    } else if(i > 0) {
        futureOrbit.push(position);
    } else {
        currentPosition = new WorldWind.Position(position.latitude,position.longitude,position.altitude);
        pastOrbit.push(position);
        futureOrbit.push(position);
    }
    }
    return currentPosition;
}

currentPosition = addorbit();
// update orbit using current position
function updateOrbit(currentPosition ) {
    // print all Layers
    wwd.removeLayer(wwd.layers[9]);

    var satrec = satellite.twoline2satrec(tle_line_1, tle_line_2);

    var now = new Date();
    var pastOrbit = [];
    var futureOrbit = [];
    for(var i = -98; i <= 98; i++) {
    var time = new Date(now.getTime() + i*60000);

    var position = getPosition(satrec, time)

    if(i < 0) {
        pastOrbit.push(position);
    } else if(i > 0) {
        futureOrbit.push(position);
    } else {
        continue;
    }
        // Orbit Path
        var pathAttributes = new WorldWind.ShapeAttributes(null);
        pathAttributes.outlineColor = WorldWind.Color.RED;
        pathAttributes.interiorColor = new WorldWind.Color(1, 0, 0, 0.5);
        
        var pastOrbitPath = new WorldWind.Path(pastOrbit);
        pastOrbitPath.useSurfaceShapeFor2D = true;
        pastOrbitPath.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        pastOrbitPath.attributes = pathAttributes;
        
        var pathAttributes = new WorldWind.ShapeAttributes(pathAttributes);
        pathAttributes.outlineColor = WorldWind.Color.GREEN;
        pathAttributes.interiorColor = new WorldWind.Color(0, 1, 0, 0.5);
        
        var futureOrbitPath = new WorldWind.Path(futureOrbit);
        futureOrbitPath.useSurfaceShapeFor2D = true;
        futureOrbitPath.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        futureOrbitPath.attributes = pathAttributes;
        
        var orbitLayer = new WorldWind.RenderableLayer("Orbit");
        
        orbitLayer.addRenderable(pastOrbitPath);
        orbitLayer.addRenderable(futureOrbitPath);
    }
    wwd.addLayer(orbitLayer);
    wwd.redraw();

}

// Define a position for locating the model.
var ISSposition = currentPosition;

// Create a Collada loader and direct it to the desired directory and .dae file.
var colladaLoader = new WorldWind.ColladaLoader(ISSposition);
colladaLoader.init({dirPath: './model/collada-models/'});
var ISSscene = null;
colladaLoader.load('ISS.dae', function (scene) {
    scene.scale = 500000;
    modelLayer.addRenderable(scene); // Add the Collada model to the renderable layer within a callback.
    ISSscene = scene;
});


// set ISS to current location
function update(){
    function updateLatitudeLongitudeAltitude(position) {
        latitudePlaceholder.textContent = degreesToText(position.latitude, 'NS');
        longitudePlaceholder.textContent = degreesToText(position.longitude, 'EW');
        altitudePlaceholder.textContent = (Math.round(position.altitude / 10) / 100) + "km";
    }

    var satrec = satellite.twoline2satrec(tle_line_1, tle_line_2);
    var simulatedDays = (Date.now() - start_time) / time_per_rotation;

    var millisPerDay = 24 * 3600 * 1000; // 24 hours/day * 3600 seconds/hour * 1000 milliseconds/second
    var simulatedMillis = simulatedDays * millisPerDay;
    var simulatedDate = new Date(start_time + simulatedMillis);
    var position = getPosition(satrec,simulatedDate);
    ISSscene.position = position;
    currentPosition.latitude = position.latitude;
    currentPosition.longitude = position.longitude;
    currentPosition.altitude = position.altitude;
    updateLatitudeLongitudeAltitude(currentPosition);

    if(follow) {
        
        toCurrentPosition();
    }
    if(time_per_rotation == 24*3600*1000){
        updateOrbit(position);
    }else{
        wwd.removeLayer(wwd.layers[9]);
    }
    requestAnimationFrame(update);
    wwd.redraw();
    
}
requestAnimationFrame(update);


// run helper every 1.1 seconds
var interval = setInterval(update, 100);

// Responsive altitude for mobile devices
if (screen.width > 900 ) {
  wwd.navigator.range = 1e7;
} else {
  wwd.navigator.range = 1e7;
}

// Globe
var globe = wwd.globe;

// Map
var map = new WorldWind.Globe2D();
map.projection = new WorldWind.ProjectionEquirectangular();

// Navigation
wwd.navigator.lookAtLocation = new WorldWind.Location(currentPosition.latitude,
                                                      currentPosition.longitude);

// Refresh WorldWindow to reflect changes so far
wwd.redraw();

// Update Satellite Position
var follow = false;

function toCurrentPosition() {
    wwd.navigator.lookAtLocation.latitude = currentPosition.latitude;
    wwd.navigator.lookAtLocation.longitude = currentPosition.longitude;
    wwd.navigator.handleTilt(75);
}

// Follow Satellite
var emptyFunction = function(e) {};
var regularHandlePanOrDrag = wwd.navigator.handlePanOrDrag;
var regularHandleSecondaryDrag = wwd.navigator.handleSecondaryDrag;
var regularHandleTilt = wwd.navigator.handleTilt;
var followPlaceholder = document.getElementById('follow');
function toggleFollow() {
    follow = !follow;
    if(follow) {
        followPlaceholder.textContent = 'On';
    } else {
        followPlaceholder.textContent = 'Off';
        wwd.navigator.handlePanOrDrag = regularHandlePanOrDrag;
        wwd.navigator.handleSecondaryDrag = regularHandleSecondaryDrag;
        wwd.navigator.handleTilt = regularHandleTilt;
    }
    toCurrentPosition();
    wwd.redraw();
}

// Update Globe Representation
var representationPlaceholder = document.getElementById('representation');
function toggleRepresentation() {
    if(wwd.globe instanceof WorldWind.Globe2D) {
        wwd.globe = globe;
        representationPlaceholder.textContent = '3D';
    } else {
        wwd.globe = map;
        representationPlaceholder.textContent = '2D';
    }
    wwd.redraw();
}
// Convert degrees to text
function degreesToText(deg, letters) {
    var letter;
    if(deg < 0) {
        letter = letters[1]
    } else {
        letter = letters[0]
    }
    var position = Math.abs(deg);
    var degrees = Math.floor(position);
    position -= degrees;
    position *= 60;
    var minutes = Math.floor(position);
    position -= minutes;
    position *= 60;
    var seconds = Math.floor(position * 100) / 100;
    return degrees + "° " + minutes + "' " + seconds + "\" " + letter;
}





function speedUp(){
    time_per_rotation = time_per_rotation/2;
    clearInterval(interval);
    interval = setInterval(update, 100);
}

function speedDown(){
    time_per_rotation = time_per_rotation * 2;
    clearInterval(interval);
    interval = setInterval(update, 100);
}



// get loction from user

const successCallback = (position) => {
    console.log(position);
  };
  
  const errorCallback = (error) => {
    console.log(error);
  };
  
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
// store logitude and latitude in user_position

var user_position = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: 0
};

var coordinates = new WorldWind.Position(user_position.latitude, user_position.longitude, user_position.altitude);


