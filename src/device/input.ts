import { Service, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';


export class InputHandler {
  public readonly index: number = this.accessory.context.device.index;
  private readonly service: Service;

  constructor(
    private readonly platform: IPXPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'GCE-Electronic')
      .setCharacteristic(this.platform.Characteristic.Model, 'IPX-800');

    switch(accessory.context.device.type) {
      case 'motion': {
        this.service = this.accessory.getService(this.platform.Service.MotionSensor)
         || this.accessory.addService(this.platform.Service.MotionSensor);
        break;
      }
      default: {
        this.service = this.accessory.getService(this.platform.Service.Switch)
         ||this.accessory.addService(this.platform.Service.Switch);
      }
    }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
  }

  public updateIO(state: boolean){
    this.service.updateCharacteristic(this.platform.Characteristic.On, state);
  }
}
