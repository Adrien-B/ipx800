import { API as homebridgeAPI, Logger, PlatformConfig, PlatformAccessory } from 'homebridge';
import { IPXPlatform } from '../platform';
import { IpxApiCaller } from '../ipx/api';

import { Device, IODeviceHandler, AnaDeviceHandler } from '../conf-definition/deviceConfig';
import { Graduals} from '../conf-definition/graduals';
import { Relays } from '../conf-definition/relays';
import { Inputs } from '../conf-definition/inputs';
import { AnalogInputs } from '../conf-definition/analogInputs';

export class DeviceConfReader {
  constructor(
    private readonly log: Logger,
    private readonly config: PlatformConfig,
  ){}

  private readonly configRelays = this.config.relays || [] as Array<Relays>;
  private readonly configGraduals = this.config.graduals || [] as Array<Graduals>;
  private readonly configInputs = this.config.inputs || [] as Array<Inputs>;
  private readonly configAnaInputs = this.config.analogInputs || [] as Array<AnalogInputs>;

  private readonly ipxVersion: string = this.config.api.version;

  public readonly relays = this.configRelays
    .filter(d => this.hasName(d))
    .filter(d => this.hasIndex(d));

  public readonly graduals = this.configGraduals
    .filter(d => this.hasName(d))
    .filter(d => this.hasAnaIndex(d));

  public readonly inputs = this.configInputs
    .filter(d => this.hasName(d))
    .filter(d => this.hasIndex(d));

  public readonly anaInputs = this.configAnaInputs
    .filter(d => this.hasName(d))
    .filter(d => this.hasIndex(d));

  hasName(device: Device){
    if (!device.displayName) {
      this.log.error('missing name in configuration for: ' + JSON.stringify(device));
      return false;
    }
    return true;
  }

  hasIndex(device: Device){
    if (!device.index) {
      this.log.error('missing index in configuration for: ' + JSON.stringify(device));
      return false;
    }
    return true;
  }

  hasAnaIndex(dimmer : Graduals):boolean {
    if ((!dimmer.anaIndex) && (this.ipxVersion === 'v5')) {
      this.log.error('missing anaIndex number for dimmer: ' + JSON.stringify(dimmer));
      return false;
    }
    return true;
  }

}