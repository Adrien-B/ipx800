import {Relays} from './relays.d';
import {Graduals} from './graduals.d';
import {Inputs} from './inputs.d';
import {AnalogInputs} from './analogInputs.d';
import { RelayHandler } from '../device/relay';
import { GradualHandler } from '../device/gradual';
import { InputHandler } from '../device/input';
import { AnalogInputHandler } from '../device/analogInput';

export type Device = Relays |Inputs | AnalogInputs | Graduals;
export type IODeviceHandler = GradualHandler | RelayHandler | InputHandler ;
export type AnaDeviceHandler = GradualHandler | AnalogInputHandler;