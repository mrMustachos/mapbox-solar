import moment from 'moment';
import { manufacturerSpecs } from './manufacturerSpecs';

export const hoursMinutesLabeler = function (hours, mins) {
  return `${hours !== 0 ? `${hours}h` : ''}${hours !== 0 && mins !== 0 ? ' ' : ''}${mins !== 0 ? `${mins}m` : ''}`;
}

function momentMath(startTime, endTime) {
  const start = moment.unix(startTime);
  const end = moment.unix(endTime);
  const diff = end.diff(start);

  return moment.duration(diff);
}

function momentValues(timeChunk) {
  return (timeChunk.hours() * 60) + timeChunk.minutes();
}

export const hoursMinutesMath = function (totalMinutes) {
  const getHours = Math.floor(totalMinutes / 60);
  const getMinutes = totalMinutes - (getHours * 60);

  return { getHours, getMinutes };
}

export const solsticeSpec = function () {
  const sliderSpecs = {
    minValue: 0,
    solsticeMinValue: '',
    maxValue: '',
    startValue: 0,
    solsticeMinLable: '',
    minLable: '0m',
    maxLable: '',
    startLabel: ''
  };

  const shorestDay = momentMath(1640098500, 1640134020); // December 21st 2021, 6:55:00am - 4:47:00pm
  const longestDay = momentMath(1624192860, 1624244820);// June 20th 2021, 5:41:00am - 8:07:00pm
      
  sliderSpecs.solsticeMinValue = momentValues(shorestDay);
  sliderSpecs.maxValue = momentValues(longestDay);

  sliderSpecs.solsticeMinLable = hoursMinutesLabeler(shorestDay.hours(), shorestDay.minutes());
  sliderSpecs.maxLable = hoursMinutesLabeler(longestDay.hours(), longestDay.minutes());

  return sliderSpecs;
};

export const totalDaylightSpec = function (sunlightTimestamp) {
  const sliderSpecs = { value: 0, label: '' };
  const totalSunShine = momentMath(sunlightTimestamp.sunrise, sunlightTimestamp.sunset);

  sliderSpecs.value = momentValues(totalSunShine);
  sliderSpecs.label = hoursMinutesLabeler(totalSunShine.hours(), totalSunShine.minutes());

  return sliderSpecs;
};

export const manufacturerSpecSort = function() {
  const sliderSpecs = { minEfficiency: '', maxEfficiency: '', meanEfficiency: 0, minWatts: '', maxWatts: '', meanWatts: 0 };

  manufacturerSpecs.forEach((spec) => {
    sliderSpecs.meanEfficiency += spec.avgefficiency;
    sliderSpecs.meanWatts += spec.avgWatts;
    
    // Get the lowest average efficiency value of all the manufacturer for the range picker
    if (typeof sliderSpecs.minEfficiency === 'string' || sliderSpecs.minEfficiency > spec.avgefficiency) {
      sliderSpecs.minEfficiency = spec.avgefficiency;
    }
    
    // Get the highest average efficiency value of all the manufacturer for the range picker
    if (typeof sliderSpecs.maxEfficiency === 'string' || sliderSpecs.maxEfficiency < spec.avgefficiency) {
      sliderSpecs.maxEfficiency = spec.avgefficiency;
    }
    
    // Get the lowest average wattage value of all the manufacturer for the range picker
    if (typeof sliderSpecs.minWatts === 'string' || sliderSpecs.minWatts > spec.avgWatts) {
      sliderSpecs.minWatts = spec.avgWatts;
    }
    
    // Get the highest average wattage value of all the manufacturer for the range picker
    if (typeof sliderSpecs.maxWatts === 'string' || sliderSpecs.maxWatts < spec.avgWatts) {
      sliderSpecs.maxWatts = spec.avgWatts;
    }
  });

  // Get the average of all the average efficiency to set the starting value of the range picker
  sliderSpecs.meanEfficiency = Math.ceil(sliderSpecs.meanEfficiency / manufacturerSpecs.length);

  // Get the average of all the average wattages to set the starting value of the range picker
  sliderSpecs.meanWatts = Math.floor(sliderSpecs.meanWatts / manufacturerSpecs.length);

  return sliderSpecs;
};