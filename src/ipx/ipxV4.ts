import { PlatformAccessory, CharacteristicValue, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from './api';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import MapUtils from '../utils';

export class IPXV4 implements IpxApiCaller {

  public toVerify = false;
  public verifyTimeout = false;

  async getStateByDeviceIndex(platform: IPXPlatform): Promise<Map<string, boolean>> {
    let api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all';
    return axios.get(url).then(ipxInfo => {
      let stateByIndex = new Map<string, boolean>();
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
    let api = platform.config['api'];
    let url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all';
    return axios.get(url).then(ipxInfo => {
      let positionByIndex = new Map<string, number>();
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

  async setOnDimmer(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    if (value as boolean){
      this.setDimmerPosition(101, platform, accessory);
    } else {
      this.setDimmerPosition(0, platform, accessory);
    }
    return;
  }

  async setOnRelay(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    let onType = accessory.context.device.index.charAt(0).toUpperCase() === 'V' ? accessory.context.device.index.slice(0, 2).toUpperCase() : accessory.context.device.index.charAt(0).toUpperCase();
    let index = accessory.context.device.index.substring(onType.length);
    let api = platform.config['api'];
    if(accessory.context.device.type == 'toggle'){
      let url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Toggle' + onType + '=' + index;
      platform.log.info(accessory.context.device.displayName + ' Toogle ---------- url: ' + url);
      this.sendOrder(url,platform,0);
      return;
    }
    if (value as boolean){
      let url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Set' + onType + '=' + index;
      platform.log.info(accessory.context.device.displayName + ' On ---------- url: ' + url);
      this.sendOrder(url,platform,0);
      this.addVerify(onType+index,1,url)
    } else {
      let url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Clear' + onType + '=' + index;
      platform.log.info(accessory.context.device.displayName + ' Off ---------- url: ' + url);
      this.sendOrder(url,platform,0);
      this.addVerify(onType+index,0,url)
    }
    return;
  }

  async setVRPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    let nVal = 100 - Math.min(Math.max(value as number, 0), 100);
    let api = platform.config['api'];
    let url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Set' + accessory.context.device.index + '=' + nVal;
    platform.log.info(accessory.context.device.displayName + ' ---------- on ' + url);
    platform.log.info('Set Characteristic position -> ', nVal);
    let loop = 0
    let self = this
    let myInterval = setInterval(function(){
      loop++
      if(loop > 15){
        clearInterval(myInterval);
        return;
      }
      self.getAnaPositionByDeviceIndex(platform).then(positionByIndex => {
        if(positionByIndex[accessory.context.device.index] !== undefined && nVal == positionByIndex[accessory.context.device.index]){
          platform.updateDevices();
          clearInterval(myInterval);
          return;
        }
      })
    },2000)
    this.sendOrder(url,platform,0);
    return;
  }

  async setDimmerPosition(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory) {
    let nVal = Math.min(Math.max(value as number, 0), 100);
    let api = platform.config['api'];
    let index = Number(accessory.context.device.index.substring(1));
    let url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&SetG' + ~~(index/5) + (index%5) + '=' + nVal;
    platform.log.info(accessory.context.device.displayName + ' ---------- on ' + url);
    this.sendOrder(url,platform,0);
    return;
  }

  public sendOrder(url,platform, retry){
    if(!retry){
      retry = 0;
    }
    retry++;
    if(retry > 5){
      platform.log.error('Fail after 5 try on : '+url);
      return;
    }
    platform.log.info('Call url -> ', url);
    axios.get(url).then(response => {
      if(response?.data?.status != 'Success'){
        platform.log.info('(Retry '+retry+') Error on : '+url+' result : ',response?.data);
        setTimeout(() => {
          this.sendOrder(url,platform,retry);
        }, 100 * retry);
      }else{
        platform.log.info('Succes on : '+url+' result : ',response?.data);
        if(this.verifyTimeout){
          clearTimeout(this.verifyTimeout);
        }
        this.verifyTimeout = setTimeout(() => {
          this.verify(platform);
        },1000)
      }
    }).catch(error => {
      platform.log.info('(Retry '+retry+') Error on : '+url);
      setTimeout(() => {
        this.sendOrder(url,platform,retry);
      }, 100 * retry);
    });
   
  }

  public addVerify(key,value,url){
      if(!this.toVerify){
        this.toVerify = {};
      }
      this.toVerify[key] = {
        value: value,
        url: url
      }
  }

  public verify(platform: IPXPlatform){
    platform.log.info('Begin verify on : '+JSON.stringify(this.toVerify));
    let api = platform.config['api'];
    const url = 'http://' + api.ip + '/api/xdevices.json?key=' + api.key + '&Get=all';
    return axios.get(url).then(ipxInfo => {
      platform.log.info('IPX state : '+JSON.stringify(ipxInfo.data));

    });  
  }

}
