
import { SettingsChangedEvent } from "../../renderer/utilities/SettingsChangedEvent"

export interface SettingsChangedEventListener {

	onSettingsChanged(sce: SettingsChangedEvent): void;

}


