import { FilterCondition } from "mendix/filters";
import * as $ from "mendix/filters/builders";
import { createElement, ReactElement, useState, useMemo, useReducer } from "react";
import { DatagridContainerProps, QueryParamsType } from "../../typings/DatagridProps";
import { ListAttributeValue, ListReferenceValue, ListReferenceSetValue, ObjectItem, ListValue } from "mendix";
import { Big } from "big.js";

type WidgetHeaderProps = {
    headerTitle?: string;
    queryParams?: DatagridContainerProps["queryParams"];
    ds: ListValue;
} & JSX.IntrinsicElements["div"];

type Operator = ">" | "<" | ">=" | "<=" | "contains" | "=";
type Param = ListAttributeValue<string | boolean | Big | Date> | ListReferenceValue | ListReferenceSetValue;
type Val = string | boolean | Date | Big | ObjectItem;
type Cond = [Operator, Param | undefined, Val | undefined];
type Exp = { param: Option<QueryParamsType> | null; cond: Cond; op: "AND" | "OR" | null };

const OP: Operator[] = [">", "<", ">=", "<=", "contains", "="];

const nullExp = (): Exp => ({ param: null, cond: [">", undefined, undefined], op: null });

type MACtion =
    | { t: "ADD" }
    | { t: "CLEAR" }
    | { t: "REMOVE"; index: number }
    | { t: "SET_PARAM"; index: number; param: Option<QueryParamsType> }
    | { t: "SET_COND"; index: number; cond: Cond }
    | { t: "SET_LOGIC_OP"; index: number; op: "AND" | "OR" };

function reduceExps(state: Exp[], action: MACtion): Exp[] {
    switch (action.t) {
        case "CLEAR": {
            return [];
        }
        case "REMOVE": {
            state = [...state];
            state.splice(action.index, 1);
            return state;
        }
        case "ADD": {
            if (state.length === 0) {
                return [nullExp()];
            } else {
                const exp1 = { ...state[state.length - 1], op: "OR" } as Exp;

                return [...state.slice(0, -1), exp1, nullExp()];
            }
        }
        case "SET_COND": {
            state = [...state];
            state[action.index] = { ...state[action.index], cond: action.cond };
            return state;
        }
        case "SET_LOGIC_OP": {
            state = [...state];
            state[action.index] = { ...state[action.index], op: action.op };
            return state;
        }
        case "SET_PARAM": {
            const exp = { ...state[action.index] };
            exp.param = action.param;
            exp.cond = nullExp().cond;
            exp.cond[1] = action.param.value.attr ?? action.param.value.ref;
            state = [...state];
            state[action.index] = exp;
            return state;
        }
        default:
            return state;
    }
}

export function WidgetHeader(props: WidgetHeaderProps): ReactElement | null {
    const { children, headerTitle, queryParams = [], ...rest } = props;
    const [exps, disexp] = useReducer(reduceExps, []);
    // const [v, setV] = useState<Option<QueryParamsType> | undefined>(undefined);

    // const set = (cond: number) => ({
    //     onSelect: options
    // });

    const options = useMemo(
        () => queryParams.map((p, i) => ({ label: p.name, value: p, id: `${p.name}-${i}` })),
        [queryParams]
    );

    if (!children) {
        return null;
    }

    const getFn = (op: Operator): ((...args: any[]) => FilterCondition) => {
        switch (op) {
            case ">":
                return $.greaterThan;
            case "<":
                return $.lessThan;
            case ">=":
                return $.greaterThanOrEqual;
            case "<=":
                return $.lessThanOrEqual;
            case "=":
                return $.equals;
            case "contains":
                return $.contains;
        }
    };

    const onSearch = (): void => {
        type ACC = [] | [FilterCondition] | [FilterCondition, "AND" | "OR" | null];
        const xps = [...exps].reverse();
        const [filter] = xps.reduce<ACC>((acc, exp, index, xps) => {
            const {
                cond: [operator, param, value]
            } = exp;
            const fn = getFn(operator);
            const wrapped =
                param?.type === "Reference" || param?.type === "ReferenceSet"
                    ? $.association(param.id)
                    : $.attribute(param!.id);
            const cond = fn(wrapped, $.literal(value));
            const nextOp = xps.at(index + 1)?.op ?? null;

            if (acc.length === 0) {
                return [cond, nextOp];
            }

            const [filter, logicOperator] = acc;
            return [logicOperator === "AND" ? $.and(cond, filter) : $.or(cond, filter), nextOp];
        }, []);
        // let logicOperator: "AND" | "OR" | null = null;
        // let filter: FilterCondition;
        // let exp: Exp | null = exps.at(0) ?? null;
        // while (exp !== null) {

        //     filter = exp.op ?

        // if (filter === undefined) {
        //     filter = cond;
        // } else if (logicOperator) {
        //     filter = logicOperator === "AND" ? $.and(filter, cond) : $.or(filter, cond);
        // }
        // logicOperator = "op" in exp ? exp.op : null;
        // exp = exp.arg2;

        console.log(filter);
        if (filter) {
            props.ds.setFilter(filter);
        }
    };

    return (
        <div {...rest} className="widget-datagrid-header header-filters" aria-label={headerTitle || undefined}>
            <div className="query-builder">
                <div style={{ marginBottom: 16 }}>
                    {exps.map((e, index) => (
                        <CondForm exp={e} index={index} disp={disexp} key={index} paramList={options} />
                    ))}
                    <button onClick={() => disexp({ t: "ADD" })}>Add condition</button>
                </div>
                {/* <select name="param1" id="fu">
                    {queryParams.map((param, index) => (
                        <option key={param.name} value={index}>
                            {param.name}
                        </option>
                    ))}
                </select> */}

                <button onClick={onSearch}>Search</button>
                <button>Reset filter</button>
                <button onClick={() => disexp({ t: "CLEAR" })}>Clear</button>
            </div>
            {children}
        </div>
    );
}
function CondForm(props: {
    exp: Exp;
    index: number;
    paramList: Array<Option<QueryParamsType>>;
    disp: React.Dispatch<MACtion>;
}): React.ReactElement {
    const {
        param,
        cond: [selectedOperator, prop, value]
    } = props.exp;

    const controlsProps: CondControlsProps<Val | undefined> = {
        paramList: props.paramList,
        selectedParam: param,
        operatorList: OP,
        selectedOperator,
        value,
        values: [],
        logicOperator: props.exp.op,
        onParamChange: param => props.disp({ t: "SET_PARAM", index: props.index, param }),
        onOperatorChange: op => props.disp({ t: "SET_COND", index: props.index, cond: [op, prop, value] }),
        onValueChange: value =>
            props.disp({
                t: "SET_COND",
                index: props.index,
                cond: [selectedOperator, param?.value.attr ?? param?.value.ref, value]
            }),
        onLogicOperatorChange(op) {
            props.disp({
                t: "SET_LOGIC_OP",
                op,
                index: props.index
            });
        }
    };

    return <CondControls {...controlsProps} />;
}

interface CondControlsProps<T> {
    paramList: Array<Option<QueryParamsType>>;
    selectedParam: Option<QueryParamsType> | undefined | null;
    operatorList: Operator[];
    selectedOperator: Operator;
    value: T;
    values?: Array<Option<T>>;
    onParamChange: (param: Option<QueryParamsType>) => void;
    onOperatorChange: (op: Operator) => void;
    onValueChange: (value: T) => void;
    logicOperator: "AND" | "OR" | null;
    onLogicOperatorChange: (op: "AND" | "OR") => void;
}

function CondControls<T>(props: CondControlsProps<T>): React.ReactElement {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 16 }}>
            <Combobox value={props.selectedParam} options={props.paramList} onSelect={props.onParamChange} />
            <select
                name="op"
                onChange={e => props.onOperatorChange(e.target.value as Operator)}
                value={props.selectedOperator}
            >
                {props.operatorList.map(op => (
                    <option key={op} value={op}>
                        {op}
                    </option>
                ))}
            </select>
            <ValueInput param={props.selectedParam} onChange={props.onValueChange} value={props.value} />
            {props.logicOperator && (
                <select
                    name="fodf"
                    value={props.logicOperator}
                    onChange={event => props.onLogicOperatorChange(event.target.value as "AND" | "OR")}
                >
                    <option value="AND">And</option>
                    <option value="OR">Or</option>
                </select>
            )}
        </div>
    );
}

function ValueInput<T = Val | undefined>(props: {
    param: Option<QueryParamsType> | undefined | null;
    value: T;
    onChange: (val: T) => void;
}): React.ReactElement {
    const { param } = props;

    if (param == null) {
        return <input type="text" disabled />;
    }

    if (param.value.attr) {
        return <input type={param.value.attr.type === "String" ? "text" : "number"} />;
    }

    if (param.value.ref) {
        const items = param.value.refOptions?.items ?? [];
        const options = items.map<Option<ObjectItem>>(item => ({
            id: item.id,
            value: item,
            label: param.value.refLabel?.get(item)?.value ?? item.id
        }));

        return (
            <select
                name="dfdfon"
                onChange={event => {
                    const item = items.find(o => o.id === event.target.value)!;
                    props.onChange(item as T);
                }}
            >
                {options.map(o => (
                    <option key={o.id} value={o.id}>
                        {o.label}
                    </option>
                ))}
            </select>
        );
    }

    return <div>unknown</div>;
    // if (props.param.attr) {
    //     return <input type="text" />;
    // } else if (props.param.ref) {
    //     return <Combobox value={props}>
    // }
}

type Option<T> = { label: string; value: T; id: string };

function Combobox<T>(props: {
    options: Array<Option<T>>;
    value: Option<T> | undefined | null;
    onSelect: (option: Option<T> | undefined) => void;
}): React.ReactElement {
    const [inputValue, setInputValue] = useState(props.value?.label ?? "");
    const [active, setActive] = useState<Option<T> | undefined>(undefined);
    const [hidden, setHidden] = useState(true);
    const select = (item: Option<T> | undefined): void => {
        setActive(undefined);
        props.onSelect(item);
        setInputValue(item?.label ?? "");
    };
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="cb1-input">Param</label>
            <div className="combobox" style={{ position: "relative" }}>
                <div className="group">
                    <input
                        value={inputValue}
                        id="cb1-input"
                        className="cb_edit"
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={!hidden}
                        aria-controls="cb1-listbox"
                        aria-activedescendant={active?.id}
                        onBlur={() => {
                            setHidden(true);
                            if (props.value == null) {
                                setInputValue("");
                            } else if (inputValue !== props.value.label) {
                                const [x] = props.options.filter(item => item.label.startsWith(inputValue));
                                if (x) {
                                    select(x);
                                }
                            }
                        }}
                        onChange={event => {
                            setHidden(false);
                            const value = event.currentTarget.value;
                            if (value === "") {
                                select(undefined);
                            }

                            const [x] = props.options.filter(item => item.label.startsWith(value));
                            if (x) {
                                setActive(x);
                            }
                            setInputValue(value);
                        }}
                        onKeyDown={event => {
                            if (event.code === "ArrowUp" || event.code === "ArrowDown") {
                                setHidden(false);
                                event.preventDefault();
                                const items = props.options.filter(item => item.label.startsWith(inputValue));
                                let index = active === undefined ? -1 : items.indexOf(active);
                                index += event.code === "ArrowUp" ? -1 : 1;
                                index = index >= items.length ? 0 : index;
                                setActive(items.at(index));
                            }
                            if (event.code === "Enter") {
                                setHidden(true);
                                if (active) {
                                    select(active);
                                }
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            setHidden(p => !p);
                        }}
                        id="cb1-button"
                        tabIndex={-1}
                        aria-label="Params"
                        aria-expanded={!hidden}
                        aria-controls="cb1-listbox"
                    >
                        <svg width="18" height="16" aria-hidden="true" focusable="false">
                            <polygon
                                className="arrow"
                                strokeWidth="0"
                                fillOpacity="0.75"
                                fill="currentcolor"
                                points="3,6 15,6 9,14"
                            ></polygon>
                        </svg>
                    </button>
                </div>
                <ul
                    id="cb1-listbox"
                    role="listbox"
                    aria-label="Params"
                    hidden={hidden}
                    aria-hidden={hidden}
                    style={{
                        listStyle: "none",
                        position: "absolute",
                        inset: "auto 0 auto 0",
                        background: "#fff",
                        padding: 0,
                        zIndex: 1
                    }}
                >
                    {props.options
                        .filter(item => item.label.startsWith(inputValue))
                        .map(item => (
                            <li
                                id={item.id}
                                key={item.label}
                                className={active?.id === item.id ? "active" : undefined}
                                aria-selected={props.value?.id === item.id ? true : undefined}
                                style={active?.id === item.id ? { background: "#eee" } : undefined}
                                role="option"
                                onClick={() => {
                                    select(item);
                                    setHidden(true);
                                }}
                            >
                                {item.label}
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
