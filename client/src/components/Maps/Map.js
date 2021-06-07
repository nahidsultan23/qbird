import React from 'react'
import Geocode from "react-geocode";
import MapControl from './MapControl';
import { apiKey } from '../../constants/keys/googleMapApi';
import markerIcon from "../../img/markerIcon.png";
const _ = require("lodash");
const { compose, withProps, lifecycle } = require("recompose");
const {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker
} = require("react-google-maps");
const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");
Geocode.setApiKey(apiKey);



const Map = compose(
    withProps({
        googleMapURL: "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `400px` }} />,
        mapElement: <div style={{ height: `100%` }} />,
    }),
    lifecycle({
        UNSAFE_componentWillReceiveProps(nextProps) {
            if ((this.props.center.lat !== nextProps.center.lat) || (this.props.center.lng !== nextProps.center.lng)) {
                this.state.setMyLocation(nextProps.center);
            }
        },
        componentDidMount() {
            Geocode.fromLatLng(this.props.center.lat, this.props.center.lng).then(
                response => {
                    const address = response.results[0].formatted_address;
                    this.props.onPlacesChanged({
                        coordinate: {
                            lat: this.props.center.lat,
                            lng: this.props.center.lng
                        },
                        address: address
                    });
                },
                error => {
                    console.error(error);
                }
            );
        },
        UNSAFE_componentWillMount() {
            const refs = {}
            this.setState({
                bounds: null,
                center: this.props.center,
                markers: [{
                    position: {
                        lat: this.props.center.lat, lng: this.props.center.lng
                    }
                }],
                onMapMounted: ref => {
                    refs.map = ref;
                },
                onBoundsChanged: () => {
                    this.setState({
                        bounds: refs.map.getBounds(),
                        center: refs.map.getCenter(),
                    })
                },
                onSearchBoxMounted: ref => {
                    refs.searchBox = ref;
                },
                onPlacesChanged: () => {
                    const places = refs.searchBox.getPlaces();
                    const bounds = new window.google.maps.LatLngBounds();
                    places.forEach(place => {
                        if (place.geometry.viewport) {
                            bounds.union(place.geometry.viewport)
                        } else {
                            bounds.extend(place.geometry.location)
                        }
                    });
                    const nextMarkers = places.map(place => ({
                        position: place.geometry.location,
                    }));
                    const nextCenter = _.get(nextMarkers, '0.position', this.state.center);

                    this.setState({
                        center: nextCenter,
                        markers: nextMarkers,
                    });
                    document.getElementById("searchPlaces").value = '';
                    refs.map.fitBounds(bounds);
                    Geocode.fromLatLng(this.state.markers[0].position.lat(), this.state.markers[0].position.lng()).then(
                        response => {
                            const address = response.results[0].formatted_address;
                            this.props.onPlacesChanged({
                                coordinate: {
                                    lat: this.state.markers[0].position.lat(),
                                    lng: this.state.markers[0].position.lng()
                                },
                                address: address
                            });

                        },
                        error => {
                            console.error(error);
                        }
                    );
                },
                onMarkerDragEnd: (event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    this.setState({
                        center: {
                            lat, lng
                        },
                        markers: [
                            {
                                position: {
                                    lat, lng
                                }
                            }
                        ]
                    });
                    Geocode.fromLatLng(lat, lng).then(
                        response => {
                            const address = response.results[0].formatted_address;
                            this.props.onPlacesChanged({
                                coordinate: {
                                    lat: lat,
                                    lng: lng
                                },
                                address: address
                            });

                        },
                        error => {
                            console.error(error);
                        }
                    );
                },
                setMyLocation: (event) => {
                    if (window.google && window.google.maps) {
                        const lat = event.lat;
                        const lng = event.lng;
                        var bounds = new window.google.maps.LatLngBounds(
                            new window.google.maps.LatLng(lat, lng),
                            new window.google.maps.LatLng(lat, lng),
                        );
                        this.setState({
                            center: {
                                lat, lng
                            },
                            markers: [
                                {
                                    position: {
                                        lat, lng
                                    }
                                }
                            ]
                        });
                        refs.map.fitBounds(bounds);
                        Geocode.fromLatLng(lat, lng).then(
                            response => {
                                const address = response.results[0].formatted_address;
                                this.props.onPlacesChanged({
                                    coordinate: {
                                        lat: lat,
                                        lng: lng
                                    },
                                    address: address
                                });

                            },
                            error => {
                                console.error(error);
                            }
                        );
                    }
                }
            })
        }
    }),
    withScriptjs,
    withGoogleMap
)(props =>
    <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={15}
        defaultCenter={props.center}
        onBoundsChanged={props.onBoundsChanged}
        options={{ streetViewControl: false, mapTypeControl: false, gestureHandling: "greedy" }}
    >
        {props.canMakeChanges && <SearchBox
            ref={props.onSearchBoxMounted}
            bounds={props.bounds}
            controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
            onPlacesChanged={props.onPlacesChanged}
        >
            <input
                id="searchPlaces"
                type="text"
                placeholder="Search a Location"
                style={{
                    boxSizing: `border-box`,
                    border: `1px solid transparent`,
                    width: `340px`,
                    height: `32px`,
                    marginTop: `27px`,
                    marginLeft: `10px`,
                    padding: `0 12px`,
                    borderRadius: `3px`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `14px`,
                    outline: `none`,
                    textOverflow: `ellipses`,
                }}
            />
        </SearchBox>}
        {props.canMakeChanges && <MapControl position={window.google.maps.ControlPosition.RIGHT_BOTTOM} setMyLocation={props.setMyLocation}>
        </MapControl>}
        <React.Fragment>
            {props.markers.map((marker, index) =>
                <Marker key={index} position={marker.position} draggable={props.canMakeChanges} onDragEnd={props.onMarkerDragEnd} icon={markerIcon} />
            )}
        </React.Fragment>
    </GoogleMap>
);
export default Map;


