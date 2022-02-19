import { Service, PlatformAccessory, APIEvent } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxAPI } from '../ipx/api';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class IPXRelayAccessory {
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
      case 'outlet': {
        this.service = this.accessory.getService(this.platform.Service.Outlet) || this.accessory.addService(this.platform.Service.Outlet);
        break;
      }
      case 'fan': {
        this.service = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan);
        break;
      }
      case 'valve': {
        this.service = this.accessory.getService(this.platform.Service.Valve) || this.accessory.addService(this.platform.Service.Valve);
        break;
      }
      default: { //lightbulb
        this.service = this.accessory.getService(this.platform.Service.Lightbulb)
        ||this.accessory.addService(this.platform.Service.Lightbulb);
      }
    }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => ipx.setOn(v, this.platform, this.accessory));

  }
}
