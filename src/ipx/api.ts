import { PlatformAccessory, CharacteristicValue} from 'homebridge';
import { IPXPlatform } from '../platform';

export abstract class IpxApiCaller {

  public abstract setOn(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory): void;
  public abstract setBrightness(value: CharacteristicValue, platform: IPXPlatform, accessory: PlatformAccessory): void;
  public abstract getStateByNumber(platform: IPXPlatform): Promise<Map<number, boolean>>;
  public abstract getAnaStateByNumer(platform: IPXPlatform): Promise<Map<number, number>>;

}