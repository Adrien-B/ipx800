import {Relays} from './relays.d';
import {Dimmers} from './dimmers.d';
import {Inputs} from './inputs.d';
import {AnalogInputs} from './analogInputs.d';

export type Device = Relays |Inputs | AnalogInputs | Dimmers;
export type DeviceHandler = DimmerHandler | RelayHandler | InputHandler;
import { RelayHandler } from '../device/relay';
import { DimmerHandler } from '../device/dimmer';
import { InputHandler } from '../device/input';