import { PlatformAccessory, CharacteristicValue, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from './api';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import MapUtils from '../utils';

export class IPXV4 implements IpxApiCaller {

  public getAnaPositionByNumer(platform: IPXPlatform): Promise<Map<string, number>> {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all ';
    return axios.get(url).then(ipxInfo => ipxInfo.data);
  }

  async getStateByNumber(platform: IPXPlatform): Promise<Map<string, boolean>> {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all ';
    return axios.get(url).then(ipxInfo => ipxInfo.data);
  }

  async setOnDimmer(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) : Promise<AxiosResponse> {
    if (value as boolean){
      return this.setDimmerPosition(101, platform, accessory);
    } else {
      return this.setDimmerPosition(0, platform, accessory);
    }
  }

  async setOnRelay(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) : Promise<AxiosResponse> {
    const api = platform.config['api'];
    platform.log.debug('Set Characteristic On ->', value);
    if (value as boolean){
      const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetR=' + accessory.context.device.index.substring(1);
      return axios.get(url);
    } else {
      const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&ClearR=' + accessory.context.device.index.substring(1);
      return axios.get(url);
    }
  }

  async setVRPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory): Promise<AxiosResponse> {
    const nVal = 100 - Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetVR' + accessory.context.device.index + '=' + nVal;
    platform.log.error('dimmer v4------ '+ accessory.context.device.displayName + ' ---------- on ' + url);
    platform.log.debug('Set Characteristic Brightness -> ', nVal);
    return axios.get(url);
  }

  async setDimmerPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory): Promise<AxiosResponse> {
    const nVal = Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetG' + accessory.context.device.index + '=' + nVal;
    platform.log.error('dimmer v4------ '+ accessory.context.device.displayName + ' ---------- on ' + url);
    platform.log.debug('Set Characteristic Brightness -> ', nVal);
    return axios.get(url);
  }

}
