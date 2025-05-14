# Homebridge IPX800 Plugin

This plugin brings support of IPX800 to homekit.
As now it support different devices :
1. ipx v5
    * relays (ipx, x8r)
    * gradual (x-dimmer, x4vr)
    * digital inputs (ipx, x24d, x8d, is312)
    * analog inputs (ipx, x-thl)
2. ipx v4
    * relays
    * gradual (x-dimmer, x4Vr)
    * analog inputs (ipx, x-thl)


This is heavily based on the hombridge plateform template it may let you control your ipx800 relays.

## Install Development Dependencies

Using a terminal on the computer running homebridge:

```
#clone plugin
git clone https://github.com/Adrien-B/ipx800.git

# install dependency
cd ipx800
Chmod +x install.sh;./install.sh

homebridge -D
```

or manually
```
cd ipx800
npm install
sudo npm install -g  typescript rimraf
#build and link plugin
npm run build 
npm link #or sudo npm link
```

## Configure the plugin

In homebridge set the ipx api settings
* ip
* api-key
* version
* pollInterval
* webhookPort
* webhookPath

See the following json snippet exemple: 
```
 "api": {
            "ip": "*.*.*.*",
            "key": "*",
            "version": "v5",
            "pollInterval": 60,
            "webhookPort": 58698,
            "webhookPath": "TODO"
        },

```

After this configuration you can trigger a refresh of state by calling https://IP_HOMEBRIDGE:webhookPort/webhookPath, you can for exemple add this in ipx800v4 push to trigger an update when relay state change

### Configure v5 devices
Than add all your devices (relays, dimmer, inputs).
See the following json snippet exemple for v5: 
```
            "relays": [
                {
                    "displayName": "bedroom",
                    "type": "light",
                    "index": 65542
                }
            ],
            "graduals": [
                {
                    "displayName": "kitchen",
                    "type": "light",
                    "index": 65842,
                    "anaIndex": 196642
                },
                {
                    "displayName": "corridor",
                    "type": "covering",
                    "anaIndex": 196642
                }
            ],
            "analogInputs": [
                {
                    "displayName": "garden",
                    "type": "light",
                    "index": 262142
                },
                {
                    "displayName": "cellar",
                    "type": "temperature",
                    "index": 262142
                }
            ],
            "inputs": [
                {
                    "displayName": "living room",
                    "type": "switch",
                    "index": 42
                }
            ],
```


### Configure v4 devices


            "relays": [
                {
                    "displayName": "chambre",
                    "type": "light",
                    "index": "r2"
                },
                {
                    "displayName": "ventilation",
                    "type": "fan",
                    "index": "r3"
                }
            ],
            "graduals": [
                {
                    "displayName": "corridor",
                    "type": "covering",
                    "anaIndex": "VR02"
                }
            ],
            "analogInputs": [
                {
                    "displayName": "séjour",
                    "type": "temperature",
                    "index": "THL1-TEMP"
                },
                {
                    "displayName": "extérieur",
                    "type": "temperature",
                    "index": "THL2-LUM"
                }
            ],
