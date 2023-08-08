import {Relays} from './relays';
import {Graduals} from './graduals';
import {Inputs} from './inputs';
import {AnalogInputs} from './analogInputs';
import { RelayHandler } from '../device/relay';
import { GradualHandler } from '../device/gradual';
import { InputHandler } from '../device/input';
import { AnalogInputHandler } from '../device/analogInput';

export type Device = Relays |Inputs | AnalogInputs | Graduals;
export type IODeviceHandler = GradualHandler | RelayHandler | InputHandler ;
export type AnaDeviceHandler = GradualHandler | AnalogInputHandler;