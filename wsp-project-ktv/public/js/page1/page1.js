let map;
let position = {
  //tecky lat lng
  lat: 22.28741732335821,
  lng: 114.14825137062151
};
const locations = {
  teckyAcademySW: { lat: 22.28741732335821, lng: 114.14825137062151, name: "Dickson", userId: 1 },
  kennethSW: { lat: 22.28727611225081, lng: 114.14816413695156, name: "Kenneth", userId: 2 },
  veronSW: { lat: 22.28747652002179, lng: 114.14783556635241, name: "Veronica", userId: 3 },
  tonySW: { lat: 22.287487067791258, lng: 114.14812055105575, name: "Tony", userId: 4 },
  alexSW: { lat: 22.258256684644195, lng: 114.13151809990066, name: "Alex", userId: 5 }
}
let infoWindows = []


window.onload = initPage1


async function fetchUsers() {
  let userRes = await fetch('/users')
  let users = await userRes.json()
  let usersContainerElem = document.querySelector('.users-container')
  console.table(users)

  for (let user of users) {
    usersContainerElem.innerHTML += `
                         <div onclick="viewProfile(${user.id})" class="user-container col-sm-6 col-lg-4">
                            <img src="/assets/img/user/${user.image}" class="pig">
                            <div class="name">${user.username}</div>
                        </div>
        `

  }
}

function setTabEventListener() {
  let radios = document.querySelectorAll('input[name=tab-control]')


  for (let radio of radios) {
    radio.addEventListener('click', () => {
      let tabButtons = document.querySelectorAll('.tab-button')
      for (let tabButton of tabButtons) {
        tabButton.classList.remove('active')
      }
      let activeTab = document.querySelector('input[name=tab-control]:checked').value

      tabButtons[activeTab - 1].classList.add('active')
    })

  }
}

//Google Map :
function constructInfoWindowContent(info) {
  let { name } = info
  return /*HTML*/`
  <div id="info-window-box">
  
  <div class="info-icon-container">
<img src="/assets/img/user/${name}.jpeg" class="info-icon">
</div>
  <br>
    <div>
      <i class="fa-solid fa-paw"></i>
        <strong> ${name}</strong>
      </div>
    <div class="info-window-profile">
      <button class="info-window-profile-btn">
        <a href="/pages/profile.html?userId=${info.userId}">
          profile
        </a>
      </button>
      </div>
    </div>
  
  `
}

async function initMap() {
  let nearbyUserCurrentLocations = await getNearbyLocation()
  const mapOptions = {
    // center: { lat: 22.302711, lng: 114.177216 },
    center: position,
    zoom: 20,
    mapId: 'd9c50b3a32453687'
  };
  //insert 入html 
  const mapDiv = document.getElementById('googleMap');
  const map = new google.maps.Map(mapDiv, mapOptions);
  const locationButton = document.querySelector(".custom-map-control-button");

  window.onload = onloadCurrentLocation();

  // 控制button位置
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);
  locationButton.addEventListener("click", onloadCurrentLocation)

  function onloadCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          postCurrentLocationToServer(pos)
          infoWindow.setPosition(pos);
          infoWindow.setContent(/*HTML*/`
          <div id="youAreHere">
          <div><i class="fa-solid fa-child-reaching"></i></div>
          <div>YOU</div>
          </div>
          `);

          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  async function postCurrentLocationToServer(pos) {
    let res = await fetch('/userCurrentLocation', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pos)
    })
    let result = await res.json()
  }

  async function getNearbyLocation() {

    let res = await fetch('/nearbyLocation')

    return await res.json()

  }


  let markers = addMarkers(map)
  clusterMarkers(map, markers)
  addPanToMarker(map, markers)


  // infoWindow.open(map,markers[1]);
  let infoWindow
  for (let i = 0; i < markers.length; i++) {
    infoWindow = new google.maps.InfoWindow({
      // content: constructInfoWindowContent(locations[Object.keys(locations)[i]]),
      content: constructInfoWindowContent(locations[Object.keys(locations)[i]]),

      // position: position,
      maxWidth: 200,

    });
    infoWindows.push(infoWindow)

    // infoWindow2.open(map, markers[i]);
  }
  return map;
}

function closeAllInfoWindows() {
  for (let infoWindow of infoWindows) {
    infoWindow.close()
  }
}

function addMarkers(map) {
  const markers = [];
  for (const location in locations) {
    const markerOptions = {
      map: map,
      position: locations[location],
      icon: '../assets/img/googlemap/3d-orange-pin.png'
    }
    markers.push(new google.maps.Marker(markerOptions))
  }
  return markers
}

function clusterMarkers(map, markers) {
  var mc = new MarkerClusterer(map, markers, {
    imagePath: 'https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/images/m'
  });
}

function addPanToMarker(map, markers) {
  markers = markers.map((marker, index) => {
    marker.addListener('click', event => {
      closeAllInfoWindows()
      const location = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      map.panTo(location);
      infoWindows[index].open(map, marker);

    });
  });
  return markers;
}

async function viewProfile(userId) {
  window.location.href = `/pages/profile.html?userId=${userId}`
}


function initPage1() {
  initMap()
  fetchUsers()
  setTabEventListener()
}
