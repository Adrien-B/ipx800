import { PlatformAccessory, CharacteristicValue, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxAPI } from './api';
import axios from 'axios';

export class IPXV5 implements IpxAPI{
  async setOn(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/io/' + accessory.context.device.index + '?ApiKey=' + api.key ;
    if (value as boolean){
      const json = JSON.stringify({ on: true });
      platform.log.error('turning on '+ accessory.context.device.displayName + '  using  ' + url + '  sending  ' + json);
      axios.put(url, json);
    } else {
      const json = JSON.stringify({ on: false });
      platform.log.error('turning off '+ accessory.context.device.displayName+ '  using  ' + url + '  sending  ' + json);
      axios.put(url, json);
    }
    platform.log.debug('Set Characteristic On ->', value);
  }

  async setBrightness(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory){
    const nVal = Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/ana/' + accessory.context.device.brightIndex + '?ApiKey=' + api.key ;
    const json = JSON.stringify({ virtual: true, value: nVal});
    platform.log.error('setting level of '+ accessory.context.device.displayName + ' using  ' + url + '  sending  ' + json);
    axios.put(url, json);
    platform.log.debug('Set Characteristic Brightness -> ', nVal);
  }

}