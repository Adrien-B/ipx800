import { Service, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';
import axios from 'axios';
import { IpxApiCaller } from '../ipx/api';


export class DimmerHandler {
  public readonly index: number = this.accessory.context.device.index;
  public readonly anaIndex: number = this.accessory.context.device.anaIndex;
  private service: Service;
  private readonly characteristic;
  private pullError = false;

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
      case 'covering': {
        this.service = this.accessory.getService(this.platform.Service.WindowCovering) ||
         this.accessory.addService(this.platform.Service.WindowCovering);
        this.characteristic = this.platform.Characteristic.CurrentPosition;
        break;
      }
      case 'fan': {
        this.service = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan);
        this.characteristic = this.platform.Characteristic.RotationSpeed;
        break;
      }
      default: { //lightbulb
        this.service = this.accessory.getService(this.platform.Service.Lightbulb)
        ||this.accessory.addService(this.platform.Service.Lightbulb);
        this.characteristic = this.platform.Characteristic.Brightness;
      }
    }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => ipx.setOn(v, this.platform, this.accessory));
    this.service.getCharacteristic(this.characteristic).onSet(v => ipx.setBrightness(v, this.platform, this.accessory));

  }

  async updateAnaCharacteristic(value: number){
    this.service.updateCharacteristic(this.characteristic, value);
  }

  async updateIO(value: boolean){
    this.service.updateCharacteristic(this.platform.Characteristic.On, value);
  }
}
