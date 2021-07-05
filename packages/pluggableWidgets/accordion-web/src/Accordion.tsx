import { createElement, ReactElement, useMemo } from "react";
import { ValueStatus } from "mendix";

import { Accordion as AccordionComponent, AccordionGroups } from "./components/Accordion";
import { useIconGenerator } from "./utils/iconGenerator";

import { AccordionContainerProps } from "../typings/AccordionProps";
import { Header } from "./components/Header";

export function Accordion(props: AccordionContainerProps): ReactElement | null {
    const accordionGroups: AccordionGroups | undefined = useMemo(() => {
        if (props.groups.some(group => group.visible.value === undefined || group.headerText.value === undefined)) {
            return undefined;
        }

        return props.groups.map(group => {
            let header = group.headerContent;

            if (group.headerRenderMode === "text") {
                header = <Header heading={group.headerHeading} text={group.headerText.value} />;
            }

            return {
                header,
                content: group.content,
                initiallyCollapsed: group.initialCollapsedState === "collapsed",
                visible: group.visible.value!,
                dynamicClassName: group.dynamicClass?.value
            };
        });
    }, [props.groups]);

    const generateIcon = useIconGenerator(
        props.advancedMode,
        props.animateIcon,
        { data: props.icon?.value, loading: props.icon?.status === ValueStatus.Loading },
        { data: props.expandIcon?.value, loading: props.expandIcon?.status === ValueStatus.Loading },
        { data: props.collapseIcon?.value, loading: props.collapseIcon?.status === ValueStatus.Loading }
    );

    if (!accordionGroups) {
        return null;
    }

    return (
        <AccordionComponent
            id={props.name}
            class={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            groups={accordionGroups}
            collapsible={props.collapsible}
            animateContent={props.animate}
            singleExpandedGroup={props.collapsible ? props.expandBehavior === "singleExpanded" : undefined}
            generateHeaderIcon={generateIcon}
            showGroupHeaderIcon={props.showIcon}
        />
    );
}
