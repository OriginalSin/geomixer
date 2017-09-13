# WWFAlert
Internal scripts of WWF project (deforestration monitoring at Russia Far East)

### Original data
1x1 degree grid, 3 TIFF files for each cell (all TIFFs have single int16 channel):
  * `r_date_c.tif` - data, number of day from the beginning of the year (1-365)
  * `r_loss_c.tif` - loss probability, 0-100
  * `cong_c.tif` - loss confidence (0-3)
  
### RGB Composite
Original files are processed by `16bit2rgb.exe` (not included) to make single 8-bit RGB TIFF for each cell. Node.js script `combine_16bit2rgb.js` is used to process all the cells.
Format of the RGB file is the following:
  * R channel: low 8 bits of date
  * G channel
    * bits 0-3: bits 8-11 of date
    * bits 6-7: confidence
  * B channel: loss probability
  
RGB composites are processed by GeoMixer Tiling Tool (see `run_tiling.bat`) and uploaded to GeoMixer server as raster layer.

`frontend/Leaflet.WWFAlarm.js` browser Leaflet plugin is used to show that raster layer on a map (only API, no UI).
`frontend/WWFPlugin.js` is a plugin for GeoMixer Editor to show this layer in Editor.

### Clusterization
Rest python and Node.js scripts are used to vectorize RGB composites:
  * `process.py`(`combine.js`) - extract clusters separately by dates
  * `process_single.py`(`combine_single.js`) - extract clusters without taking dates into consideration

### Leaflet Plugin API

Instantiation example

```
var alarm = new L.WWFAlarm('CAABA6E0E4FF45319C731E56B1064D0D', '1D116AC56D694C0B8CDCA87C06D1961A');
```

Methods:
  * `setDateInterval(daysMin, daysMax)`: show changes only within given date interval (daysMin, daysMax - number of days from January 1st)
  * `setLossThreshold(minLoss)`: minLoss from 0 to 100
  * `setConfThreshold(minConf)`: minConf from 0 to 3
 