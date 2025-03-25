export class SettingsChangedEvent /*extends java.lang.Throwable*/ {

    public static readonly EventType_CacheSizeChanged: string = "CACHE_CHANGED";
    public static readonly EventType_CacheToggled: string = "CACHE_TOGGLED";
    public static readonly EventType_FontChanged: string = "FONT_CHANGED";


    private _EventType: string;
    public constructor(eventType: string) {
        if (eventType != null && eventType !== "") {
            this._EventType = eventType;
        }
    }

    public getEventType(): string {
        return this._EventType;
    }

}
