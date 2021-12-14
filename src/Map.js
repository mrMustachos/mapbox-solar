import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import axios from 'axios';
import * as turf from '@turf/turf';


import { solarPanelSizes } from './utils/manufacturerSpecs';
import { solsticeSpec, manufacturerSpecSort, totalDaylightSpec, hoursMinutesMath, hoursMinutesLabeler } from './utils/helperFuncs';
import {
  RadioContainer,
  RadioLabel,
  DataContainerStyle,
  MapContainer,
  RangeContainerStyle,
  ResultsContainerStyle,
  RangeTitleStyled,
  RangeInputStyled,
  MapInfoContainer,
  MapDataContainer,
} from './styles/MapStyles';


import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './styles/Map.css';

const { REACT_APP_MAPBOXGL_ACCESSTOKEN, REACT_APP_SOLAR_API_KEY, REACT_APP_WEATHER_API_KEY } = process.env;

mapboxgl.accessToken = `${REACT_APP_MAPBOXGL_ACCESSTOKEN}`;
const solarRpiKey = REACT_APP_SOLAR_API_KEY;
const weatherApiKey = REACT_APP_WEATHER_API_KEY;

const Map = () => {  
  const [lng, setLng] = useState(-95);
  const [lat, setLat] = useState(38);
  const [zoom, setZoom] = useState(4);
  
  // const [lng, setLng] = useState(-118.1785);
  // const [lat, setLat] = useState(34.1212);
  // const [zoom, setZoom] = useState(20);
  
  const [area, setArea] = useState('');
  const [panelCount, setPanelCount] = useState('');
  const [dailyKilowattHours, setDailyKilowattHours] = useState('');
  const [totalKilowattHours, setTotalKilowattHours] = useState('');
  
  const [currMonth, setCurrMonth] = useState(new Date().getMonth());
  const [sliderWattsMinMaxs, setSliderWattsMinMaxs] = useState({});
  const [sliderSunlightMinMaxs, setSliderSunlightMinMaxs] = useState({});
  
  const mapContainerRef = useRef(null);
  const currMonthRef = useRef(currMonth);
  const panelSize = useRef(solarPanelSizes);
  
  const lngVal = useRef(lng);
  const latVal = useRef(lat);
  const zoomVal = useRef(zoom);
  
  const [inputWattageValue, setInputWattageValue] = useState(0);
  const [inputLocationEfficiencyValue, setInputLocationEfficiencyValue] = useState(75);
  const [inputSunlightValue, setInputSunlightValue] = useState({});
  const [inputPanelValue, setInputPanelValue] = useState(panelSize.current.residentialPanelWidth);
  
  function updateSunlightValue(totalMinutes) {
    const { getHours, getMinutes } = hoursMinutesMath(totalMinutes);
    setInputSunlightValue({ value: totalMinutes, label: hoursMinutesLabeler(getHours, getMinutes) });
  }
  
  // update results
  useEffect(() => {
    if (inputSunlightValue?.value) {
      const totalPanels = Math.floor(area / (inputPanelValue * panelSize.current.panelHeight));
      // Using the formula from here to get a general idea on usage : shorturl.at/xyGK7
      const dailyKilowattHoursPerPanel = (inputWattageValue * (inputSunlightValue.value / 60) * (inputLocationEfficiencyValue / 100)) / 1000;
      const totalOutput = (dailyKilowattHoursPerPanel * totalPanels).toFixed(2);

      setPanelCount(totalPanels);
      setDailyKilowattHours(dailyKilowattHoursPerPanel);
      setTotalKilowattHours(totalOutput);
    }

  }, [area, inputWattageValue, inputSunlightValue, inputPanelValue, inputLocationEfficiencyValue]);

  // Initialize first half of sunlight slider when component mounts
  useEffect(() => {
    const sliderSpecs = solsticeSpec();
    setSliderSunlightMinMaxs(sliderSpecs);
  }, []);

  // Initialize watts slider when component mounts
  useEffect(() => {
    setCurrMonth(new Date().getMonth());
    const sliderSpecs = manufacturerSpecSort();
    setSliderWattsMinMaxs(sliderSpecs);
    setInputWattageValue(sliderSpecs.meanWatts);
  }, []);

  
  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lngVal.current, latVal.current],
      zoom: zoomVal.current,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        trash: true,
      },
      // Set mapbox-gl-draw to draw by default. Users does not have to click the polygon control button first.
      defaultMode: 'draw_polygon',
    });

    map.addControl(new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    }));

    // Add navigation control to draw polygons (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add navigation control (the +/- zoom buttons, recenter button)
    map.addControl(draw);

    async function getWeatherData() {
      const updatedLat = parseInt(map.getCenter().lat.toFixed(4));
      const updatedLng = parseInt(map.getCenter().lng.toFixed(4));

      // weather API: shorturl.at/uHRU0
      // solar irradiance API: shorturl.at/fhyG3
      try {
        const resWeatherData = await Promise.all([
          axios.get(`https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${solarRpiKey}&lat=${updatedLat}&lon=${updatedLng}`), // this was me taking a crack at the precise way of doing it
          axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${updatedLat}&lon=${updatedLng}&units=imperial&appid=${weatherApiKey}`),
        ])

        const [solarRadiation, sunlight] = resWeatherData;
        const months = solarRadiation.data.outputs.avg_dni.monthly;

        const weatherData = {
          sunlight: sunlight.data.sys,
          solarRadiation: Object.keys(months).map(month => months[month])[currMonthRef.current] // This data provides monthly average daily total solar resource averaged over surface cells of 0.1 degrees in both latitude and longitude, or about 10 km in size. The values returned are kWh/m2/day (kilowatt hours per square meter per day).
        };

        const sliderSpecs = totalDaylightSpec(weatherData.sunlight);
        setInputSunlightValue(sliderSpecs);

      } catch (err) {
        console.log('!!err', err);
      }
    };

    function updateArea() {
      const data = draw.getAll();

      if (data.features.length > 0) {
        getWeatherData(map);
        const area = turf.area(data);
        const roundedArea = Math.round(area * 100) / 100;
        setArea(roundedArea);
      } else {
        setArea('');
      }
    }
    
    function calcMapData() {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    }

    map.on('move', calcMapData);
    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <div>
      <ResultsContainerStyle>
        <MapInfoContainer>
          <div>
              <span>Longitude</span><span>{lng}</span>
          </div>
          <div>
            <span>Latitude</span><span>{lat}</span>
          </div>
          <div>
            <span>Zoom</span><span>{zoom}</span>
          </div>
        </MapInfoContainer>
        {(!!area && !!panelCount && !!dailyKilowattHours && !!totalKilowattHours) && (
          <>
            <MapDataContainer>
              <div>
                <span>Installation Size</span><span>{area}m<sup>2</sup></span>
              </div>
              <div>
                <span>Total Panels</span><span>{panelCount}</span>
              </div>
              <div>
                <span>Per Panel</span><span>{dailyKilowattHours} kWh/h</span>
              </div>
              <div>
                <span>Installation</span><span>{totalKilowattHours} kWh/h</span>
              </div>
            </MapDataContainer>
          </>
        )}
      </ResultsContainerStyle>
      <DataContainerStyle>
        <RadioContainer>
          <RadioLabel htmlFor="residential">
            <span>Residential</span>
            <input
              type="radio"
              id="residential"
              name="panelSize"
              value={panelSize.current.residentialPanelWidth}
              onChange={(e) => setInputPanelValue(parseFloat(e.currentTarget.value))}
              checked={inputPanelValue === panelSize.current.residentialPanelWidth}
              />
          </RadioLabel>
          <RadioLabel htmlFor="commercial">
            <span>Commercial</span>
            <input
              type="radio"
              id="commercial"
              name="panelSize"
              value={panelSize.current.commercialPanelWidth}
              onChange={(e) => setInputPanelValue(parseFloat(e.currentTarget.value))}
              checked={inputPanelValue === panelSize.current.commercialPanelWidth}
            />
          </RadioLabel>
        </RadioContainer>
        {Object.keys(inputSunlightValue).length > 0 && (
          <>
            <RangeContainerStyle>
              <RangeTitleStyled>Efficiency Capacity: {inputLocationEfficiencyValue}%</RangeTitleStyled>
              <RangeInputStyled
                type="range"
                min={0}
                max={100}
                value={inputLocationEfficiencyValue}
                onChange={(e) => setInputLocationEfficiencyValue(e.target.value)}
              />
            </RangeContainerStyle>
            <RangeContainerStyle>
              <RangeTitleStyled>Watts: {inputWattageValue}</RangeTitleStyled>
              <RangeInputStyled
                type="range"
                min={sliderWattsMinMaxs?.minWatts}
                max={sliderWattsMinMaxs?.maxWatts}
                value={inputWattageValue}
                onChange={(e) => setInputWattageValue(e.target.value)}
              />
            </RangeContainerStyle>
            <RangeContainerStyle>
              <RangeTitleStyled>Sunlight: {inputSunlightValue.label}</RangeTitleStyled>
              <RangeInputStyled
                type="range"
                min={sliderSunlightMinMaxs?.minValue}
                max={sliderSunlightMinMaxs?.maxValue}
                value={inputSunlightValue?.value}
                onChange={(e) => updateSunlightValue(e.target.value)}
              />
            </RangeContainerStyle>
          </>
        )}
      </DataContainerStyle>
      <MapContainer ref={mapContainerRef} />
    </div>
  );
};

export default Map;
