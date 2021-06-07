import * as React from "react"
import * as ReactDOM from "react-dom"
import { MAP } from "react-google-maps/lib/constants"
import * as PropTypes from "prop-types"

// export interface ControlProps {
//     position: google.maps.ControlPosition
// }

export default class MapControl extends React.Component {
    static contextTypes = { [MAP]: PropTypes.object }

    map = null
    controlDiv = null
    divIndex = null

    UNSAFE_componentWillMount() {
        this.map = this.context[MAP];
        this.controlDiv = document.createElement("div");
        var firstChild = document.createElement('a');
        firstChild.style.backgroundColor = '#fff';
        firstChild.style.border = 'none';
        firstChild.style.outline = 'none';
        firstChild.style.width = '39px';
        firstChild.style.height = '39px';
        firstChild.style.borderRadius = '2px';
        firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        firstChild.style.cursor = 'pointer';
        firstChild.style.marginRight = '10px';
        firstChild.style.padding = '5px';
        firstChild.title = 'Your Location';
        this.controlDiv.appendChild(firstChild);

        var secondChild = document.createElement('div');
        secondChild.style.margin = '5px';
        secondChild.style.width = '18px';
        secondChild.style.height = '18px';
        secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
        secondChild.style.backgroundSize = '185px 18px';
        secondChild.style.backgroundPosition = '0px 0px';
        secondChild.style.backgroundRepeat = 'no-repeat';
        secondChild.id = 'your_location_img';
        firstChild.appendChild(secondChild);

        firstChild.addEventListener(
            'click',
            e => {
                this.setCurrentPositionToMyLocation();
            },
            { passive: true }
        );

        this.divIndex = this.map.controls[this.props.position].push(this.controlDiv) - 1
    }

    setCurrentPositionToMyLocation = () => {
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const coords = pos.coords;
                const newCoord = { lat: coords.latitude, lng: coords.longitude };
                this.setState({
                    currentPosition: newCoord
                });
                this.props.setMyLocation(this.state.currentPosition);
            });

        }
    }

    componentWillUnmount() {
        this.map.controls[this.props.position].removeAt(this.divIndex)
    }
    render() {
        return ReactDOM.createPortal(this.props.children, this.controlDiv)
    }
}
