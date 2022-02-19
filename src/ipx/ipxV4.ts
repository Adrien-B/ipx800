import { PlatformAccessory, CharacteristicValue, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxAPI } from './api';
import axios from 'axios';

export class IPXV4 implements IpxAPI {
  async setOn(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    const api = platform.config['api'];
    platform.log.debug('Set Characteristic On ->', value);
    if (value as boolean){
      const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetR=' + accessory.context.device.index;
      platform.log.error('on v4------- '+ accessory.context.device.displayName + ' ---------- on ' + url);
      axios.get(url);
    } else {
      const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&ClearR=' + accessory.context.device.index;
      platform.log.error('off v4------- '+ accessory.context.device.displayName + ' ---------- on ' + url);
      axios.get(url);
    }
  }



  async setBrightness(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    const nVal = Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetVR' + accessory.context.device.index + '=' + nVal;
    platform.log.error('dimmer v4------ '+ accessory.context.device.displayName + ' ---------- on ' + url);
    axios.get(url);
    platform.log.debug('Set Characteristic Brightness -> ', nVal);
  }

}