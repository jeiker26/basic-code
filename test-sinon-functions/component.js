import React from "react";
import PropTypes from "prop-types";
import assets from "@nex/static-assets";
import { withExternalScript } from "../with-external-script/WithExternalScript";
import { Config } from "../../config/config";
import "./MapSites.scss";

const MAPS_OPTIONS = {
  zoom: 6,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  center: {
    lat: 40.4026073,
    lng: -3.699314
  } // default center point
};

export class MapSitesComponent extends React.Component {
  static propTypes = {
    sites: PropTypes.arrayOf(
      PropTypes.shape({
        city: PropTypes.string,
        name: PropTypes.string,
        postalCode: PropTypes.string,
        province: PropTypes.string,
        streetNumber: PropTypes.string,
        streetType: PropTypes.string
      })
    )
  };

  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.map = null;
    this.googleMap = null; // Api google maps
  }

  componentDidMount() {
    if (typeof window.google !== "undefined") {
      this.googleMap = window.google.maps;
      this.map = new this.googleMap.Map(this.mapRef.current, MAPS_OPTIONS);

      this.renderMarkers();
    }
  }

  renderMarkers() {
    const bounds = new this.googleMap.LatLngBounds();
    const geoCoder = new this.googleMap.Geocoder(); // Get lat and lng by address string

    this.props.sites &&
      this.props.sites.forEach(site => {
        geoCoder.geocode(
          {
            address: `${site.streetName} ${site.streetNumber}, ${site.postalCode}, ${site.city}, ${
              site.province
            }`
          },
          (results, status) => {
            if (status === "OK") {
              const marker = new this.googleMap.Marker({
                position: results[0].geometry.location,
                icon: assets.img.common.icons.marker.url,
                animation: this.googleMap.Animation.DROP
              });

              marker.setMap(this.map);

              // For center and auto zoom map
              bounds.extend(marker.getPosition());
              this.map.fitBounds(bounds); // auto-zoom
              this.map.panToBounds(bounds); // auto-center
            } else {
              console.log("Geocode was not successful for the following reason: " + status);
            }
          }
        );
      });
  }

  render() {
    return <div className="map" ref={this.mapRef} />;
  }
}

export const MapSites = withExternalScript(
  MapSitesComponent,
  `https://maps.googleapis.com/maps/api/js?key=${Config.services.google.apiKey}`
);
