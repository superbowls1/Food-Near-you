let map;
let currentIndex = 0;
let foodPlaces = [];
const foodContainer = document.getElementById('food-container');
const dislikeButton = document.getElementById('dislike');
const likeButton = document.getElementById('like');
const findFoodButton = document.getElementById('find-food');
const actions = document.getElementById('actions');

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 12
    });
}

function loadFoodPlace(index) {
    foodContainer.innerHTML = '';
    if (index < foodPlaces.length) {
        const foodPlace = foodPlaces[index];
        const foodElement = document.createElement('div');
        foodElement.classList.add('food');
        foodElement.innerHTML = `
            <img src="${foodPlace.photoUrl}" alt="${foodPlace.name}">
            <h3>${foodPlace.name}</h3>
            <p>${foodPlace.vicinity}</p>
        `;
        foodContainer.appendChild(foodElement);
        map.setCenter(foodPlace.location);
    } else {
        foodContainer.innerHTML = '<h3>No more food places</h3>';
    }
}

dislikeButton.addEventListener('click', () => {
    const foodElement = document.querySelector('.food');
    if (foodElement) {
        foodElement.style.transform = 'translateX(-100%)';
        foodElement.style.opacity = '0';
        setTimeout(() => {
            currentIndex++;
            loadFoodPlace(currentIndex);
        }, 300);
    }
});

likeButton.addEventListener('click', () => {
    const foodElement = document.querySelector('.food');
    if (foodElement) {
        foodElement.style.transform = 'translateX(100%)';
        foodElement.style.opacity = '0';
        setTimeout(() => {
            currentIndex++;
            loadFoodPlace(currentIndex);
        }, 300);
    }
});

findFoodButton.addEventListener('click', () => {
    const radiusInMiles = radiusInput.value;
    const radiusInMeters = radiusInMiles * 1609.34; // Convert miles to meters
    console.log(`Radius in miles: ${radiusInMiles}`);
    console.log(`Radius in meters: ${radiusInMeters}`);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            fetchNearbyFoodPlaces(latitude, longitude, radiusInMeters);
        }, error => {
            console.error('Error getting location:', error);
            alert('Error getting your location. Please try again.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

function fetchNearbyFoodPlaces(lat, lng, radius) {
    const service = new google.maps.places.PlacesService(map);
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: radius,
        type: ['restaurant', 'food'],
        rankBy: google.maps.places.RankBy.DISTANCE
    };

    service.nearbySearch(request, (results, status) => {
        console.log('Nearby search status:', status);
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            foodPlaces = results.map(place => ({
                name: place.name,
                vicinity: place.vicinity,
                photoUrl: place.photos ? place.photos[0].getUrl({ maxWidth: 250, maxHeight: 150 }) : 'https://via.placeholder.com/250x150?text=No+Image',
                location: place.geometry.location
            }));
            console.log('Found places:', foodPlaces);
            clearMarkers();
            addMarkers(foodPlaces);
            currentIndex = 0;
            loadFoodPlace(currentIndex);
            actions.classList.remove('hidden');
        } else {
            console.error('Places service failed:', status);
            document.getElementById('map').innerHTML = '<p>Failed to load map. Please try again later.</p>';
        }
    });
}

let markers = [];

function addMarkers(places) {
    places.forEach(place => {
        const marker = new google.maps.Marker({
            position: place.location,
            map: map,
            title: place.name
        });
        markers.push(marker);
    });
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();

    // Select the radius input element
    const radiusInput = document.getElementById('radius');

    // Check if the radius input element is successfully selected
    if (radiusInput) {
        console.log('Radius input element found:', radiusInput);
    } else {
        console.error('Radius input element not found.');
    }
});
