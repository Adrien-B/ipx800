import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { RelayHandler } from './device/relay';
import { DimmerHandler } from './device/dimmer';
import { InputHandler } from './device/input';
import { IPXV4 } from './ipx/ipxV4';
import { IPXV5 } from './ipx/ipxV5';
import { IpxApiCaller } from './ipx/api';
import {Api} from './config/api.d';
import {Relays} from './config/relays.d';
import {Dimmers} from './config/dimmers.d';
import {Inputs} from './config/inputs.d';
import {AnalogInputs} from './config/analogInputs.d';
import {Device, DeviceHandler} from './config/deviceConfig';


/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class IPXPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public readonly configApi = this.config.api as Api;
  public readonly configRelays = this.config.relays || [] as Array<Relays>;
  public readonly configDimmers = this.config.dimmers || [] as Array<Dimmers>;
  public readonly configInputs = this.config.dimmers || [] as Array<Inputs>;
  public readonly configAnaInputs= this.config.dimmers || [] as Array<AnalogInputs>;

  private pullError = false;
  readonly ipxVersion: string = this.config.api.version;
  public readonly ipxApiCaller: IpxApiCaller = ((this.configApi.version === 'v5') ? new IPXV5: new IPXV4);

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(device: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', device.displayName);

    this.accessories.push(device);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */

  discoverDevices() {
    const relays = this.configRelays
      .filter(d => this.validNameAndIndex(d))
      .map(d => this.findOrCreate(d, (da) => new RelayHandler(this, da, this.ipxApiCaller)));

    const dimmers = this.configDimmers
      .filter(d => this.validNameAndIndex(d))
      .filter(d => this.validDimmer(d))
      .map(d => this.findOrCreate(d, (da) => new DimmerHandler(this, da, this.ipxApiCaller)));

    const inputs = this.configInputs
      .filter(d => this.validNameAndIndex(d))
      .map(d => this.findOrCreate(d, (da) => new InputHandler(this, da)));

    /*
    const xthls = (this.config['analogInputs'] || [])
      .filter(this.validNameAndIndex);
    //.map(d => this.findOrCreate(d, a => new IPXInputsAccessory(this, a, this.ipxApiCaller)));*/

    const devices : Array<DeviceHandler> = relays.concat(dimmers, inputs);
    //.concat(xthls)

    setInterval( () => {
      this.ipxApiCaller.getStateByNumber(this)
        .then(stateByIndex => Promise.all(devices.map(d => d.updateIO(stateByIndex[d.index]))))
        .catch(err => {
          if (!this.pullError) {
            this.log.error('could not update input/output devices state', err);
            this.pullError = true;
          }
        });
    }, 30000);
  }


  validNameAndIndex(device: Device){
    if ((!device.displayName) || (!device.index)) {
      this.log.error('missing name or index in configuration for: ' + device);
      return false;
    }
    return true;
  }

  validDimmer(dimmer : Dimmers):boolean {
    if ((!dimmer.anaIndex) && (this.ipxVersion === 'v5')) {
      this.log.error('missing ana index number for dimmer: ' + dimmer.displayName);
      return false;
    }
    return true;
  }

  findOrCreate(
    device: Device,
    builder: (device: PlatformAccessory) => DeviceHandler,
  ):DeviceHandler {
    const uuidSeed = device.displayName.replace(/\s/g, '') + '-' + device.index;
    const uuid = this.api.hap.uuid.generate(uuidSeed);

    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      return builder(existingAccessory);
    } else {
      this.log.info('Adding new accessory:', device.displayName);
      const accessory = new this.api.platformAccessory(device.displayName, uuid);
      accessory.context.device = device;
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      return builder(accessory);
    }
  }

}
