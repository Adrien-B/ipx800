import { truncate } from 'fs';
import { PlatformAccessory, CharacteristicValue, APIEvent, Logger} from 'homebridge';
import { IPXPlatform } from '../platform';

export abstract class IpxAPI {

  public abstract setOn(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory);
  public abstract setBrightness(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory);

}