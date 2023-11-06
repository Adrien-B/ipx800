import { PlatformAccessory, CharacteristicValue, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from './api';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import MapUtils from '../utils';

export class IPXV4 implements IpxApiCaller {

  async getStateByDeviceIndex(platform: IPXPlatform): Promise<Map<string, boolean>> {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all ';
    return axios.get(url).then(ipxInfo => {
      const stateByIndex = new Map<string, boolean>();
      Object.keys(ipxInfo.data).map(key => {
        if (key.startsWith('R') || key.startsWith('V')) {
          stateByIndex[key] = ipxInfo.data[key];
        } else if (key.startsWith('G')) {
          stateByIndex[key] = (ipxInfo.data[key]['Etat'] === 'ON');
        }
      });
      return stateByIndex;
    });
  }

  public getAnaPositionByDeviceIndex(platform: IPXPlatform): Promise<Map<string, number>> {
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all ';
    return axios.get(url).then(ipxInfo => {
      const positionByIndex = new Map<string, number>();
      Object.keys(ipxInfo.data).map(key => {
        if (key.startsWith('G')) {
          positionByIndex[key] = (ipxInfo.data[key]['Valeur']);
        } else if (key.startsWith('THL')) {
          positionByIndex[key] = ipxInfo.data[key];
        } else if (key.startsWith('VR')) {
          let info = key.replace('VR','').split('-')
          if(info.length == 2){
            let vrkey = 'VR'+String((parseInt(info[0])-1)*4+parseInt(info[1])).padStart(2, "0");
            positionByIndex[vrkey] = ipxInfo.data[key];
          }
        }
      });
      return positionByIndex;
    });
  }

  async setOnDimmer(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) : Promise<AxiosResponse> {
    if (value as boolean){
      return this.setDimmerPosition(101, platform, accessory);
    } else {
      return this.setDimmerPosition(0, platform, accessory);
    }
  }

  async setOnRelay(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) : Promise<AxiosResponse> {
    const onType = accessory.context.device.index.charAt(0).toUpperCase() === 'V' ? accessory.context.device.index.slice(0, 2).toUpperCase() : accessory.context.device.index.charAt(0).toUpperCase();
    const index = accessory.context.device.index.substring(onType.length);
    const api = platform.config['api'];
    if (value as boolean){
      const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Set' + onType + '=' + index;
      platform.log.debug('v4------ '+ accessory.context.device.displayName + ' On ---------- url: ' + url);
      return axios.get(url);
    } else {
      const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Clear' + onType + '=' + index;
      platform.log.debug('v4------ '+ accessory.context.device.displayName + ' Off ---------- url: ' + url);
      return axios.get(url);
    }
  }

  async setVRPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory): Promise<AxiosResponse> {
    const nVal = 100 - Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Set' + accessory.context.device.index + '=' + nVal;
    platform.log.debug('dimmer v4------ '+ accessory.context.device.displayName + ' ---------- on ' + url);
    platform.log.debug('Set Characteristic position -> ', nVal);
    let loop = 0
    let self = this
    let myInterval = setInterval(function(){ 
      platform.log.info('Begin interval');
      loop++
      if(loop > 6){
        platform.log.info('End too much loop');
        clearInterval(myInterval);
      }
      self.getAnaPositionByDeviceIndex(platform).then(positionByIndex => {
        platform.log.info('Index '+accessory.context.device.index);
        platform.log.info(JSON.stringify(positionByIndex));
        if(positionByIndex[accessory.context.device.index] !== undefined){
          let currentPosition = positionByIndex[accessory.context.device.index];
          platform.log.info('Target '+nVal+' Current pos '+(100 - currentPosition));
          if(nVal == (100 - currentPosition)){
            platform.log.info('Move ended');
            platform.updateDevices();
            clearInterval(myInterval);
          }else{
            platform.log.info('Update position');
            //accessory.getService(platform.Service.WindowCovering).updateCharacteristic(platform.Characteristic.CurrentPosition, 100 - currentPosition);
          }
        }
      })
    },5000)
    return axios.get(url);
  }

  async setDimmerPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory): Promise<AxiosResponse> {
    const nVal = Math.min(Math.max(value as number, 0), 100);
    const api = platform.config['api'];
    const index = Number(accessory.context.device.index.substring(1));
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetG' + ~~(index/5) + (index%5) + '=' + nVal;
    platform.log.debug('dimmer v4------ '+ accessory.context.device.displayName + ' ---------- on ' + url);
    return axios.get(url);
  }

}
