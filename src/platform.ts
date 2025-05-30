import { API as homebridgeAPI, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Device, IODeviceHandler, AnaDeviceHandler } from './conf-definition/deviceConfig';
import { Api } from './conf-definition/api';
import { IPXV4 } from './ipx/ipxV4';
import { IPXV5 } from './ipx/ipxV5';
import { IpxApiCaller } from './ipx/api';
import { DeviceConfReader } from './device/deviceConfBuilder';
import { RelayHandler } from './device/relay';
import { GradualHandler } from './device/gradual';
import { InputHandler } from './device/input';
import { AnalogInputHandler } from './device/analogInput';
import { WebhookServer } from  './webhookServer';


/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class IPXPlatform implements DynamicPlatformPlugin {
  public readonly model = 'IPX-800';

  public readonly Service: typeof Service = this.homebridgeAPI.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.homebridgeAPI.hap.Characteristic;
  private readonly configApi = this.config.api as Api;
  private readonly ipxApiCaller: IpxApiCaller = ((this.configApi.version === 'v5') ? new IPXV5: new IPXV4);
  private readonly webhookServer: WebhookServer = new WebhookServer;


  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public ioDevices;
  public anaDevices;

  private pullError = false;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly homebridgeAPI: homebridgeAPI,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.homebridgeAPI.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      let deviceConf = new DeviceConfReader(this.log, this.config);
      let relays = deviceConf.relays.map(d => this.findOrCreate(d, (da) => new RelayHandler(this, da, this.ipxApiCaller)));
      let graduals = deviceConf.graduals.map(d => this.findOrCreate(d, (da) => new GradualHandler(this, da, this.ipxApiCaller))) ;
      let inputs = deviceConf.inputs.map(d => this.findOrCreate(d, (da) => new InputHandler(this, da))) ;
      let anaInputs = deviceConf.anaInputs.map(d => this.findOrCreate(d, (da) => new AnalogInputHandler(this, da))) ;
      this.ioDevices = relays.concat(graduals, inputs).filter(d => d.index);
      this.anaDevices = graduals.concat(anaInputs);
      this.webhookServer.start(this);

      this.updateDevices();

      let self = this
      setInterval(function() {
          self.updateDevices();
      }, this.config.api.pollInterval * 1000 || 3500);
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(device: PlatformAccessory) {
    let deviceConf = new DeviceConfReader(this.log, this.config);
    this.accessories.push(device);
  }

  updateDevices() {
    this.ipxApiCaller.getState(this)
      .then(state => {
        Promise.all(this.ioDevices.map(d => {
          if (state.stateByIndex[d.index.toUpperCase()] !== undefined) {
            d.updateIO(state.stateByIndex[d.index.toUpperCase()]);
          }
        }));
        Promise.all(this.anaDevices.map(d => {
          let anaIndex = d.anaIndex || d.index;
          if (state.positionByIndex[anaIndex.toUpperCase()] !== undefined) {
            d.updateAnaValue(state.positionByIndex[anaIndex.toUpperCase()]);
          }
        }));
        this.pullError = false;
      })
      .catch(err => {
        if (!this.pullError) {
          this.log.error('could not update input/output devices state', err);
          this.pullError = true;
        }
    });
  }

  getDeviceUUID(device: Device){
    return this.homebridgeAPI.hap.uuid.generate(device.displayName.replace(/\s/g, '') + '-' + device.index);
  }

  findOrCreate(
    device: Device,
    builder: (device: PlatformAccessory) => IODeviceHandler | AnaDeviceHandler,
  ):IODeviceHandler | AnaDeviceHandler {
    let uuid = this.getDeviceUUID(device);
    let existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      return builder(existingAccessory);
    } else {
      this.log.info('Adding new accessory:', device.displayName);
      let accessory = new this.homebridgeAPI.platformAccessory(device.displayName, uuid);
      accessory.context.device = device;
      this.homebridgeAPI.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      return builder(accessory);
    }
  }

}
