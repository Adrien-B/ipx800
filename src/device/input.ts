import { Service, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';


export class InputHandler {
  public readonly index: string = this.accessory.context.device.index;
  private readonly service: Service;
  private readonly characteristic;

  constructor(
    private readonly platform: IPXPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'GCE-Electronic')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.displayName);

    switch(accessory.context.device.type) {
      case 'motion': {
        this.service = this.accessory.getService(this.platform.Service.MotionSensor)
         || this.accessory.addService(this.platform.Service.MotionSensor);
        this.characteristic = this.platform.Characteristic.MotionDetected;
        break;
      }
      case 'switch' : {
        this.service = this.accessory.getService(this.platform.Service.Switch)
         ||this.accessory.addService(this.platform.Service.Switch);
        this.characteristic = this.platform.Characteristic.On;
        break;
      }
      default: {
        this.service = this.accessory.getService(this.platform.Service.ContactSensor)
         ||this.accessory.addService(this.platform.Service.ContactSensor);
        this.characteristic = this.platform.Characteristic.ContactSensorState;
      }
    }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
  }

  public updateIO(value: boolean){
    if(this.service.getCharacteristic(this.characteristic).value != value){
      this.service.updateCharacteristic(this.characteristic, value);
    }
  }
}
