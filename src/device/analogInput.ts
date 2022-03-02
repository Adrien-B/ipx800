import { Service, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';


export class AnalogInputHandler {
  public readonly index: number = this.accessory.context.device.index;
  public readonly anaIndex: number = this.accessory.context.device.anaIndex;
  private readonly service: Service;
  private readonly characteristic;

  constructor(
    private readonly platform: IPXPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'GCE-Electronic')
      .setCharacteristic(this.platform.Characteristic.Model, 'IPX-800');

    switch(accessory.context.device.type) {
      case 'humidity': {
        this.service = this.accessory.getService(this.platform.Service.HumiditySensor)
         || this.accessory.addService(this.platform.Service.HumiditySensor);
        this.characteristic = this.platform.Characteristic.CurrentRelativeHumidity;
        break;
      }
      case 'light': {
        this.service = this.accessory.getService(this.platform.Service.LightSensor)
         || this.accessory.addService(this.platform.Service.LightSensor);
        this.characteristic = this.platform.Characteristic.CurrentAmbientLightLevel;
        break;
      }
      default: {
        this.service = this.accessory.getService(this.platform.Service.TemperatureSensor)
         ||this.accessory.addService(this.platform.Service.TemperatureSensor);
        this.characteristic = this.platform.Characteristic.CurrentTemperature;
      }
    }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
  }

  async updateAnaValue(state: number){
    if (this.characteristic === this.platform.Characteristic.CurrentAmbientLightLevel) {
      state = Math.max(state, 0.1);
    }
    this.service.updateCharacteristic(this.characteristic, state);
  }
}
