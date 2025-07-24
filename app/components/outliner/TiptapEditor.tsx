// src/Tiptap.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import type { OutlinerNode } from "~/store/use-outliner-store";
import { BsTypeH1, BsTypeH2, BsTypeH3 } from "react-icons/bs";
import { BiParagraph } from "react-icons/bi";
import { LiaUnderlineSolid } from "react-icons/lia";
import { HiMiniItalic } from "react-icons/hi2";
import { GrStrikeThrough } from "react-icons/gr";
import { LuCodeXml } from "react-icons/lu";
import { AiOutlineBold } from "react-icons/ai";
import { useEffect } from "react";
import useOutlinerStore from "~/store/use-outliner-store";

const extensions = [StarterKit];

const BubbleMenuOptions = [
  {
    icon: <BsTypeH1 className="w-4 h-4" />,
    label: "Heading 1",
    action: (editor: any) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: any) => editor.isActive("heading", { level: 1 }),
  },
  {
    icon: <BsTypeH2 className="w-4 h-4" />,
    label: "Heading 2",
    action: (editor: any) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: any) => editor.isActive("heading", { level: 2 }),
  },
  {
    icon: <BsTypeH3 className="w-4 h-4" />,
    label: "Heading 3",
    action: (editor: any) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor: any) => editor.isActive("heading", { level: 3 }),
  },
  // {
  //   icon: <BiParagraph className="w-4 h-4" />,
  //   label: "Paragraph",
  //   action: (editor: any) => editor.chain().focus().setParagraph().run(),
  //   isActive: (editor: any) => editor.isActive("paragraph"),
  // },
  {
    icon: <AiOutlineBold className="w-4 h-4" />,
    label: "Bold",
    action: (editor: any) => editor.chain().focus().toggleBold().run(),
    isActive: (editor: any) => editor.isActive("bold"),
  },
  {
    icon: <LiaUnderlineSolid className="w-4 h-4" />,
    label: "Underline",
    action: (editor: any) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor: any) => editor.isActive("underline"),
  },
  {
    icon: <HiMiniItalic className="w-4 h-4" />,
    label: "Italic",
    action: (editor: any) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor: any) => editor.isActive("italic"),
  },
  {
    icon: <GrStrikeThrough className="w-4 h-4" />,
    label: "Strike",
    action: (editor: any) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor: any) => editor.isActive("strike"),
  },
  {
    icon: <LuCodeXml className="w-4 h-4" />,
    label: "Code",
    action: (editor: any) => editor.chain().focus().toggleCode().run(),
    isActive: (editor: any) => editor.isActive("code"),
  },
];

const TiptapEditor = ({
  node,
  onNodeUpdate,
  onKeyDown,
  handlePaste,
}: {
  node: OutlinerNode;
  onNodeUpdate: (id: string, data: Partial<OutlinerNode>) => void;
  onKeyDown: (id: string) => void;
  handlePaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    id: string
  ) => void;
}) => {
  const handleEnterKey = useOutlinerStore((state) => state.handleEnterKey);
  const handleTabKey = useOutlinerStore((state) => state.handleTabKey);
  const handleBackspaceKey = useOutlinerStore(
    (state) => state.handleBackspaceKey
  );
  const editor = useEditor({
    extensions,
    content: node.content,
    onUpdate: ({ editor }) => {
      onNodeUpdate(node.id, { content: editor.getHTML() });
    },
    // Set up keydown event handler
    editorProps: {
      handleKeyDown: (view, event) => {
        // Create a synthetic keyboard event that matches what onKeyDown expects
        onKeyDown(node.id);
        console.log("event", event);
        const { from, to } = editor.state.selection;
        const nodeText = editor.getText();
        const offset = from - editor.state.selection.$from.start();
        const textLeft = nodeText.slice(0, offset);
        const textRight = nodeText.slice(offset);
        const isEmpty = nodeText.trim().length === 0;
        const onStartOfLine = textLeft.trim().length === 0;
        const onEndOfLine = textRight.trim().length === 0;
        const onMiddleOfLine = !onStartOfLine && !onEndOfLine && !isEmpty;

        // Explicitly prevent Enter key from creating a new line
        if (event.key === "Enter") {
          event.preventDefault();
          // Return true to prevent default Tiptap behavior
          handleEnterKey(
            node.id,
            nodeText,
            isEmpty,
            onMiddleOfLine ? "middle" : onEndOfLine ? "end" : "start",
            textLeft,
            textRight
          );
          return true;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          handleTabKey(node.id);
          return true;
        }
        if (event.key === "Backspace" && isEmpty) {
          event.preventDefault();
          handleBackspaceKey(node.id, isEmpty);
          return true;
        }
        // Important: Return false to allow event to propagate up to react-hotkeys-hook
        return false;
      },
    },
  });

  // Set active node on focus/click to ensure hotkeys work
  useEffect(() => {
    const handleFocus = () => {
      // Create a minimal synthetic event
      onKeyDown(node.id);
    };

    if (editor?.view?.dom) {
      editor.view.dom.addEventListener("focus", handleFocus);
      editor.view.dom.addEventListener("mousedown", handleFocus);

      return () => {
        editor.view.dom.removeEventListener("focus", handleFocus);
        editor.view.dom.removeEventListener("mousedown", handleFocus);
      };
    }
  }, [editor, node.id, onKeyDown]);

  return (
    <>
      <BubbleMenu
        editor={editor}
        options={{
          placement: "top",
          offset: 10,
        }}
        style={{
          position: "relative",
        }}
      >
        <div className="absolute -top-8 -left-15 bg-white z-[999]! flex items-center justify-center gap-x-2 p-1 shadow-2xl border border-gray-200 rounded-sm">
          {BubbleMenuOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => option.action(editor)}
              className={` cursor-pointer hover:bg-gray-100 rounded-md p-1 ${
                option.isActive(editor) ? "bg-gray-200" : ""
              }`}
              type="button"
            >
              {option.icon}
            </button>
          ))}
        </div>
      </BubbleMenu>

      <EditorContent
        data-node-id={node.id}
        editor={editor}
        style={{
          border: "none",
          outline: "none",
          resize: "none",
          overflow: "hidden",
          background: "transparent",
        }}
        frameBorder={0}
        className={`w-full text-black border-none focus:ring-0 outline-none resize-none overflow-hidden block selection:bg-blue-100`}
        onPaste={(e) =>
          handlePaste(
            e as unknown as React.ClipboardEvent<HTMLTextAreaElement>,
            node.id
          )
        }
      />
    </>
  );
};

export default TiptapEditor;
