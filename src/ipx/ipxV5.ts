import { PlatformAccessory, CharacteristicValue, APIEvent, UnknownContext } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from './api';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import MapUtils from '../utils';

export class IPXV5 implements IpxApiCaller{

  async getStateByDeviceIndex(platform: IPXPlatform): Promise<Map<string, boolean>> {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/io' + '?ApiKey=' + api.key ;
    return axios.get(url).then(ipxInfo => MapUtils.toBoolByNum(ipxInfo.data, '_id', 'on'));
  }


  async getAnaPositionByDeviceIndex(platform: IPXPlatform): Promise<Map<string, number>> {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/ana' + '?ApiKey=' + api.key ;
    return axios.get(url).then(ipxInfo => {
        const res = MapUtils.toStringByNum(ipxInfo.data, '_id', 'value');
        return res;
    });
  }


  async getState(platform: IPXPlatform): Promise {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/io' + '?ApiKey=' + api.key ;
    return axios.get(url).then(ipxInfo => MapUtils.toBoolByNum(ipxInfo.data, '_id', 'on'));
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/ana' + '?ApiKey=' + api.key ;
    return axios.get(url).then(ipxInfo => {
        const res = MapUtils.toStringByNum(ipxInfo.data, '_id', 'value');
        return res;
    });
  }


  async setOnDimmer(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    this.setOnRelay(value, platform, accessory);
    return;
  }

  async setOnRelay(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/io/' + accessory.context.device.index + '?ApiKey=' + api.key ;
    platform.log.debug('Set Characteristic On ->', value);
    if (value as boolean){
      const json = JSON.stringify({ on: true });
      platform.log.error('turning on '+ accessory.context.device.displayName + '  using  ' + url + '  sending  ' + json);
      axios.put(url, json);
    } else {
      const json = JSON.stringify({ on: false });
      platform.log.error('turning off '+ accessory.context.device.displayName+ '  using  ' + url + '  sending  ' + json);
      axios.put(url, json);
    }
    return;
  }

  async setVRPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    this.setAnaPosition(100 - (value as number), platform, accessory);
    return;
  }

  async setDimmerPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    this.setAnaPosition(100 - (value as number), platform, accessory);
    return;
  }

  async setAnaPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    const nVal = Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/core/ana/' + accessory.context.device.anaIndex + '?ApiKey=' + api.key ;
    const json = JSON.stringify({ virtual: true, value: nVal});
    platform.log.error('setting level of '+ accessory.context.device.displayName + ' using  ' + url + '  sending  ' + json);
    platform.log.debug('Set Characteristic Brightness -> ', nVal);
    axios.put(url, json);
    return;
  }

}