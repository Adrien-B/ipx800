import { Service, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';
import axios from 'axios';
import { IpxApiCaller } from '../ipx/api';


export class GradualHandler {
  public readonly index: string = this.accessory.context.device.index;
  public readonly anaIndex: string = this.accessory.context.device.anaIndex;
  private service: Service;
  private readonly characteristic;
  private state;

  constructor(
    private readonly platform: IPXPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly ipx: IpxApiCaller,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'GCE-Electronic')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.displayName);

    switch(accessory.context.device.type) {
      case 'covering': {
        this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering);
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
        this.service.getCharacteristic(this.platform.Characteristic.TargetPosition).onSet((v) => ipx.setVRPosition(v, this.platform, this.accessory));
        this.characteristic = this.platform.Characteristic.CurrentPosition; //but onSet is TargetPosition
        break;
      }
      case 'fan': {
        this.service = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan);
        this.characteristic = this.platform.Characteristic.RotationSpeed;
        this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => ipx.setOnDimmer(v, this.platform, this.accessory));
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
        this.service.getCharacteristic(this.characteristic).onSet(v => ipx.setDimmerPosition(v, this.platform, this.accessory));
        break;
      }
      default: { //lightbulb
        this.service = this.accessory.getService(this.platform.Service.Lightbulb)
        ||this.accessory.addService(this.platform.Service.Lightbulb);
        this.characteristic = this.platform.Characteristic.Brightness;
        this.service.getCharacteristic(this.platform.Characteristic.On).onSet((v) => ipx.setOnDimmer(v, this.platform, this.accessory));
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
        this.service.getCharacteristic(this.characteristic).onSet(v => ipx.setDimmerPosition(v, this.platform, this.accessory));
      }
    }
  }

  public handleOnGet() {
    this.platform.log.debug('Triggered GET graduals');
    return this.state;
  }

  async updateAnaValue(value: number){
    if (this.characteristic === this.platform.Characteristic.CurrentPosition) {
      this.state = 100 - value;
      if(this.service.getCharacteristic(this.characteristic).value != (100 - value)){
        this.service.updateCharacteristic(this.characteristic, 100 - value);
        this.service.updateCharacteristic(this.platform.Characteristic.PositionState, this.platform.Characteristic.PositionState.STOPPED);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, 100 - value);
      }
      if(this.service.getCharacteristic(this.platform.Characteristic.PositionState).value != this.platform.Characteristic.PositionState.STOPPED){
        this.service.updateCharacteristic(this.platform.Characteristic.PositionState, this.platform.Characteristic.PositionState.STOPPED);
      }
    } else {
      this.state = value;
      if(this.service.getCharacteristic(this.characteristic).value != value){
        this.service.updateCharacteristic(this.characteristic, value);
      }
    }
  }

  async updateIO(value: boolean){
    this.state = value;
    if(this.service.getCharacteristic(this.platform.Characteristic.On).value != value){
      this.service.updateCharacteristic(this.platform.Characteristic.On, value);
    }
  }
}
