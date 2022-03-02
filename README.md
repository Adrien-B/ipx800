
<p align="center">

<!-- <img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150"> -->
<img src="http://sarakha63-domotique.fr/wp-content/uploads/2018/03/IPX_800_LE_CHOIX_2.jpg" width="250">

</p>


# Homebridge IPX800 Plugin

This plugin brings support of IPX800 to homekit.
As now it support different devices :
1. ipx v5
    * relays (ipx, x8r)
    * dimmers (x-dimmer, x4vr)
    * digital inputs (ipx, x24d, x8d, is312)
    * analog inputs (ipx, x-thl)
2. ipx v4
    * relays


This is heavily based on the hombridge plateform template it may let you control your ipx800 relays.



## Install Development Dependencies

Using a terminal on the computer running homebridge:

```
#clone plugin
git clone https://github.com/Adrien-B/ipx800.git


# install dependency
cd ipx800
npm install
sudo npm install -g  typescript rimraf

# build and link plugin
npm run build 
npm run link #or sudo npm run link


#(re)start homebridge if not done already
homebridge -D
```


## Configure the plugin

In homebridge set the ipx api settings
* ip
* api-key
* version

See the following json snippet exemple: 
```
 "api": {
                "ip": "*.*.*.*",
                "key": "*",
                "version": "v5"
            },

```

Than add all your devices (relays, dimmer, inputs).
See the following json snippet exemple: 
```
            "relays": [
                {
                    "displayName": "bedroom",
                    "type": "light",
                    "index": 65542
                }
            ],
            "dimmers": [
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