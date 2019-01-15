import React from "react";
import * as sinon from "sinon";
import { MapSitesComponent } from "./MapSites";

describe("Test MapSitesComponent Suite", () => {
  const sites = [
    {
      city: "albacete",
      name: "albacete",
      postalCode: "02490",
      province: "albacete",
      streetNumber: "24",
      streetType: "Av"
    }
  ];
  const ORIGINAL_ASSIGN = window.google;
  let sandbox;
  let panToBounds;
  let fitBounds;
  let googleMock;
  let geocode;
  let marker;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    panToBounds = sandbox.stub();
    fitBounds = sandbox.stub();
    geocode = sandbox.stub();
    marker = sandbox.stub().returns({
      setMap: sandbox.stub(),
      getPosition: sandbox.stub()
    });

    googleMock = {
      maps: {
        Map: sandbox.stub().returns({
          fitBounds,
          panToBounds
        }),
        LatLngBounds: sandbox.stub().returns({
          extend: sandbox.stub()
        }),
        Geocoder: sandbox.stub().returns({
          geocode
        }),
        Marker: marker,
        Animation: {
          DROP: "foo-drop"
        }
      }
    };

    sandbox.spy(console, "log");
    window.google = googleMock;
  });

  afterEach(() => {
    sandbox.restore();
    window.google = ORIGINAL_ASSIGN;
  });

  it("should render MapSitesComponent without throwing an error", () => {
    expect(shallow(<MapSitesComponent />).exists()).toBe(true);
  });

  it("should geocode in google maps each site", () => {
    const wrapper = shallow(<MapSitesComponent sites={sites} />);
    wrapper.instance().renderMarkers();
    expect(geocode.getCall(0).args[0]).toEqual({
      address: `${sites[0].streetName} ${sites[0].streetNumber}, ${sites[0].postalCode}, ${
        sites[0].city
      }, ${sites[0].province}`
    });
  });

  it("should mark each site in google map when geocoding is success", () => {
    const fooResults = [
      {
        geometry: {
          location: "foo-location"
        }
      }
    ];

    const wrapper = shallow(<MapSitesComponent sites={sites} />);
    wrapper.instance().renderMarkers();
    const geocodeCallback = geocode.getCall(0).args[1];
    geocodeCallback(fooResults, "OK");
    expect(marker.getCall(0).args[0].position).toEqual(fooResults[0].geometry.location);
    expect(marker.getCall(0).args[0].animation).toEqual("foo-drop");
  });

  it("should console an error when geocoding fails", () => {
    const wrapper = shallow(<MapSitesComponent sites={sites} />);
    wrapper.instance().renderMarkers();
    const geocodeCallback = geocode.getCall(0).args[1];
    geocodeCallback([], "KO");
    expect(console.log.calledWith("Geocode was not successful for the following reason: KO")).toBe(
      true
    );
  });
});
