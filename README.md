
# Lettore Impronte Digitali (ita ver.)

## Description
custom card per la gestione delle impronte digitali


[![buymeacoffee_badge](https://img.shields.io/badge/Donate-buymeacoffe-ff813f?style=flat)](https://www.buymeacoffee.com/madmicio)

![all](example/fingerprint.jpg)

## hacs Card install
1. add madmicio/lettore-impronte-digitali-ita- as custom reposity

2. Find and install `lettore-impronte-digitali-ita-` plugin

3. Add a reference  inside your resources config:

  ```yaml
resources:
url: /hacsfiles/ph-meter-temperature/ph_meter.js
type: module
```


### Manual install

1. Download and copy `ph_meter.js` from (https://github.com/madmicio/pH-meter-Temperature) into your custom components  directory.

2. Add a reference `ph_meter.js` inside your resources config:

  ```yaml
  resources:
    - url: /local/"your_directory"/ph_meter.js
      type: module
  ```
### lovelace full config (ph meter & temperature):
```yaml
type: 'custom:ph-meter'
entity: sensor.ph_sensor
temperature: sensor.temperatura_acquario
```
