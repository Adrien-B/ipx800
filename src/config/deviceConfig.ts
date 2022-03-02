import {Relays} from './relays.d';
import {Dimmers} from './dimmers.d';
import {Inputs} from './inputs.d';
import {AnalogInputs} from './analogInputs.d';
import { RelayHandler } from '../device/relay';
import { DimmerHandler } from '../device/dimmer';
import { InputHandler } from '../device/input';
import { AnalogInputHandler } from '../device/analogInput';

export type Device = Relays |Inputs | AnalogInputs | Dimmers;
export type IODeviceHandler = DimmerHandler | RelayHandler | InputHandler ;
export type AnaDeviceHandler = DimmerHandler | AnalogInputHandler;