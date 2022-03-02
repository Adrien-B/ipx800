import { Service, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from '../ipx/api';



export class RelayHandler {
  public readonly index: number = this.accessory.context.device.index;
  private readonly service: Service;

  constructor(
    private readonly platform: IPXPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly ipx: IpxApiCaller,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'GCE-Electronic')
      .setCharacteristic(this.platform.Characteristic.Model, 'IPX-800');

    switch(accessory.context.device.type) {
      case 'bswitch': {
        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        break;
      }
      case 'switch': {
        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        break;
      }
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
    if (accessory.context.device.type !== 'bswitch') {
      this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => ipx.setOn(v, this.platform, this.accessory));
    } else {
      this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => {
        if (v as boolean){
          ipx.setOn(true, this.platform, this.accessory);
          new Promise(f => setTimeout(f, 250)).then(() => {
            ipx.setOn(false, this.platform, this.accessory);
            this.service.updateCharacteristic(this.platform.Characteristic.On, false);
          });
        } else {
          ipx.setOn(false, this.platform, this.accessory);
        }
      });
    }
  }

  public updateIO(state: boolean){
    this.service.updateCharacteristic(this.platform.Characteristic.On, state);
  }
}
