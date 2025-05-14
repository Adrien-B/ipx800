import { PlatformAccessory, CharacteristicValue, APIEvent, UnknownContext } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from './api';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import MapUtils from '../utils';

export class IPXV5 implements IpxApiCaller{


  async getState(platform: IPXPlatform) {
    let api = platform.config['api'];
    return axios.get('http://' + api.ip + '/api/core/ana' + '?ApiKey=' + api.key).then(ipxInfo => {
        let positionByIndex = MapUtils.toStringByNum(ipxInfo.data, '_id', 'value');
        return axios.get('http://' + api.ip + '/api/core/io' + '?ApiKey=' + api.key).then(ipxInfo => {
          let stateByIndex = MapUtils.toBoolByNum(ipxInfo.data, '_id', 'on');
          return {stateByIndex : stateByIndex, positionByIndex: positionByIndex} ;
        });
    });
  }

  async setOnDimmer(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    this.setOnRelay(value, platform, accessory);
    return;
  }

  async setOnRelay(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    let api = platform.config['api'];
    let url = 'http://' + api.ip + '/api/core/io/' + accessory.context.device.index + '?ApiKey=' + api.key ;
    platform.log.debug('Set Characteristic On ->', value);
    if (value as boolean){
      let json = JSON.stringify({ on: true });
      platform.log.debug('turning on '+ accessory.context.device.displayName + '  using  ' + url + '  sending  ' + json);
      axios.put(url, json);
    } else {
      let json = JSON.stringify({ on: false });
      platform.log.debug('turning off '+ accessory.context.device.displayName+ '  using  ' + url + '  sending  ' + json);
      axios.put(url, json);
    }
    return;
  }

  async setVRPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    this.setAnaPosition(100 - (value as number), platform, accessory);
    return;
  }

  async setDimmerPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    this.setAnaPosition(value as number, platform, accessory);
    return;
  }

  async setAnaPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    let nVal = Math.min(Math.max(value as number, 0), 100);
    let api = platform.config['api'];
    let url = 'http://' + api.ip + '/api/core/ana/' + accessory.context.device.anaIndex + '?ApiKey=' + api.key ;
    let json = JSON.stringify({ virtual: true, value: nVal});
    platform.log.debug('setting level of '+ accessory.context.device.displayName + ' using  ' + url + '  sending  ' + json);
    platform.log.debug('Set Characteristic Brightness -> ', nVal);
    axios.put(url, json);
    return;
  }

}