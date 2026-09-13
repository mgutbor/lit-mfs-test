import { BaseCustomEvent } from "@sas/lib-stic-kernel";

export class SticButtonV2ClickEvent extends BaseCustomEvent<SticButtonV2ClickEventData>{
    constructor(detail: SticButtonV2ClickEventData) {
        super("button:click", detail);
    }
}

export class SticButtonV2ClickEventData {
  
    private _value: string;
    
    constructor(value: string) {
      this._value = value;  
    }
  
    public get value(): string {
      return this._value;
    }
}