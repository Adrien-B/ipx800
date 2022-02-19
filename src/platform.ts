import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { IPXRelayAccessory } from './device/relayAccessory';
import { IPXDimmerAccessory } from './device/dimmerAccessory';
import { IPXV4 } from './ipx/ipxV4';
import { IPXV5 } from './ipx/ipxV5';
import { IpxAPI } from './ipx/api';
//import { rmdir } from 'fs';

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

  public readonly ipxVersion: string;
  public readonly ipxApi: IpxAPI;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.config = config;
    this.ipxVersion = this.config['api']?.version;
    this.log.debug('Finished initializing platform:', this.config.name);
    this.ipxApi = ((this.ipxVersion === 'v5') ? new IPXV5: new IPXV4);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }


  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {

    (this.config['relays'] || [])
      .filter(this.validNameAndIndex)
      .map(d => this.findOrCreate(d, a => new IPXRelayAccessory(this, a, this.ipxApi)));


    (this.config['dimmers'] || [])
      .filter(this.validNameAndIndex)
      .filter(this.validDimmer)
      .map(d => this.findOrCreate(d, a => new IPXDimmerAccessory(this, a, this.ipxApi)));

    (this.config['inputs'] || [])
      .filter(this.validNameAndIndex);
    //.map(d => this.findOrCreate(d, a => new IPXInputsAccessory(this, a, this.ipxApi)));

    (this.config['xthls'] || [])
      .filter(this.validNameAndIndex);
    //.map(d => this.findOrCreate(d, a => new IPXInputsAccessory(this, a, this.ipxApi)));
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  validNameAndIndex(device){
    if ((!device.displayName) || (!device.index)) {
      this.log.error('missing name or index in configuration for: ' + device);
      return false;
    }
    return true;
  }

  validDimmer(dimmer){
    if ((!dimmer.brightIndex) && (this.ipxVersion === 'v5')) {
      this.log.error('missing ana index number for dimmer: ' + dimmer.displayName);
      return false;
    }
    return true;
  }

  findOrCreate(
    device,
    constructor: (accessory: PlatformAccessory) => void,
  ) {
    device.uuid = device.displayName.replace(/\s/g, '') + '-' + device.index;
    const uuid = this.api.hap.uuid.generate(device.uuid);

    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      constructor(existingAccessory);
    } else {
      this.log.info('Adding new accessory:', device.displayName);
      const accessory = new this.api.platformAccessory(device.displayName, uuid);
      accessory.context.device = device;
      constructor(accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}
