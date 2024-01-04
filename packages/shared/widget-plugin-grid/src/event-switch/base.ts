export type InferEvent<T> = T extends React.EventHandler<infer E> ? E : never;

export type EventName = "onClick" | "onDoubleClick" | "onKeyDown" | "onKeyUp" | "onMouseDown";

export type DOMElement<T> = { [name in EventName]?: React.DOMAttributes<T>[name] };

export type EventCaseEntry<Context, Element, Name extends EventName, Event = InferEvent<DOMElement<Element>[Name]>> = {
    eventName: Name;
    handler(ctx: Context, event: Event): void;
    filter?(ctx: Context, event: Event): boolean;
};

export type ElementEntries<Context, Element> = {
    [Name in EventName]: EventCaseEntry<Context, Element, Name>;
}[EventName];

export type EntriesByEvent<Context, Element> = {
    [Name in EventName]?: Array<EventCaseEntry<Context, Element, Name>>;
};