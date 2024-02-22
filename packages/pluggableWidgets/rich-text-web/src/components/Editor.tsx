import { ReactElement, createElement, useEffect, useState, Fragment } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";

// import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import ContentEditable from "../ui/ContentEditable";
import { EditorState } from "lexical";

interface BundledEditorProps extends RichTextContainerProps {}

function MyCustomAutoFocusPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.focus();
    }, [editor]);

    return null;
}

// function onError(error: any) {
//     console.error(error);
// }

// const theme = {};

export default function BundledEditor(props: BundledEditorProps): ReactElement {
    const {} = props;

    const [_editorState, setEditorState] = useState<EditorState>();
    const [_isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const [_floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

    function onChange(editorState: EditorState) {
        setEditorState(editorState);
    }
    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    return (
        <Fragment>
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            <RichTextPlugin
                contentEditable={
                    <div className="editor-scroller">
                        <div className="editor" ref={onRef}>
                            <ContentEditable />
                        </div>
                    </div>
                }
                placeholder={<div>Enter some text...</div>}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <MyCustomAutoFocusPlugin />
            <OnChangePlugin onChange={onChange} />
        </Fragment>
    );
}
