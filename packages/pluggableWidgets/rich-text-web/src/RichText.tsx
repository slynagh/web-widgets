import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createElement } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import BundledEditor from "./components/Editor";
import { SettingsContext, useSettings } from "./context/SettingsContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import "./index.scss";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const { stringAttribute, id, width: w, height: h, widthUnit, heightUnit } = props;

    if (stringAttribute.status === "loading") {
        return <div></div>;
    }

    const { width, height } = getDimensions({
        width: w,
        widthUnit,
        height: h,
        heightUnit
    });

    const {
        settings: { isCollab, emptyEditor }
    } = useSettings();

    const initialConfig = {
        editorState: isCollab ? null : emptyEditor ? undefined : "",
        namespace: "Playground",
        nodes: [...PlaygroundNodes],
        onError: (error: Error) => {
            throw error;
        },
        theme: PlaygroundEditorTheme
    };

    return (
        <div
            id={id}
            className={classNames("widget-rich-text", `${stringAttribute.readOnly ? `editor-richtext` : ""}`)}
            style={{ width, height }}
        >
            <SettingsContext>
                <LexicalComposer initialConfig={initialConfig}>
                    <SharedHistoryContext>
                        <TableContext>
                            <BundledEditor {...props} />
                        </TableContext>
                    </SharedHistoryContext>
                </LexicalComposer>
            </SettingsContext>
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </div>
    );
}
