import { Service, PlatformAccessory, CharacteristicValue, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import axios from 'axios';
import { IpxAPI } from '../ipx/api';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class IPXDimmerAccessory {
  private service: Service;

  constructor(
    private readonly platform: IPXPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly ipx: IpxAPI,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'GCE-Electronic')
      .setCharacteristic(this.platform.Characteristic.Model, 'IPX-800');

    switch(accessory.context.device.type) {
      case 'covering': {
        this.service = this.accessory.getService(this.platform.Service.WindowCovering) ||
         this.accessory.addService(this.platform.Service.WindowCovering);
        break;
      }
      case 'fan': {
        this.service = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan);
        break;
      }
      default: { //lightbulb
        this.service = this.accessory.getService(this.platform.Service.Lightbulb)
        ||this.accessory.addService(this.platform.Service.Lightbulb);
      }
    }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => ipx.setOn(v, this.platform, this.accessory));
    this.service.getCharacteristic(this.platform.Characteristic.Brightness).onSet(
      (v) => ipx.setBrightness(v, this.platform, this.accessory),
    );
  }
}
