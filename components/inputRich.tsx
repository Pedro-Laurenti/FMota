import { Button, ButtonGroup, Modal, Input, ModalBody, ModalFooter, ModalHeader, ModalContent } from "@nextui-org/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Level } from '@tiptap/extension-heading';
import Link from "@tiptap/extension-link";
import React, { useState } from "react";
import { FaBold, FaCode, FaItalic, FaLink, FaParagraph, FaStrikethrough } from "react-icons/fa6";
import { MdTitle } from "react-icons/md";
import { IoText } from "react-icons/io5";

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  title?: string;
  isDisabled?: boolean; // New prop
}


export default function SimpleRichTextEditor({
  value,
  onChange,
  placeholder,
  title,
  isDisabled = false, // Default value
}: SimpleRichTextEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false); // Estado para alternar o modo HTML
  const [linkURL, setLinkURL] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "underline cursor-pointer text-primary",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg prose-neutral prose-headings:text-primary prose-a:text-primary prose-strong:text-secondary-foreground focus:outline-none text-primary dark:border-gray-700 border-gray-300 rounded-xl w-full min-h-[400px] max-h-[600px] overflow-y-auto p-3 border",
        style: `
          color: var(--nextui-color-text);
        `,
      },
    },
  });

  const applyLink = () => {
    if (linkURL && editor) {
      editor.chain().focus().setLink({ href: linkURL }).run();
      setLinkURL("");
      setIsModalOpen(false);
    }
  };

  const toggleParagraph = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().setParagraph().run();
  };

  const toggleHeading = (level: Level) => {
    if (!editor) return;
    editor.chain().focus().unsetLink().toggleHeading({ level }).run();
  };

  const handleHtmlChange = (html: string) => {
    if (editor) {
      editor.commands.setContent(html);
    }
  };


  if (isDisabled) {
    return (
      <div
        className="prose prose-sm sm:prose lg:prose-lg prose-neutral prose-headings:text-primary prose-a:text-primary prose-strong:text-secondary-foreground text-primary dark:border-gray-700 border-gray-300 rounded-xl w-full min-h-[400px] max-h-[600px] overflow-y-auto p-3 border"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }


  return (
    <div className="mb-4">
      {/* Controles de formatação */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-3">
        <div className="text-sm">
          {title}
        </div>
        <ButtonGroup className="flex">
          <Button
            isIconOnly variant="faded" size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            color={editor?.isActive("bold") ? "primary" : "secondary"}
            >
            <FaBold />
          </Button>
          <Button
            isIconOnly variant="faded" size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            color={editor?.isActive("italic") ? "primary" : "secondary"}
            >
            <FaItalic />
          </Button>
          <Button
            isIconOnly variant="faded" size="sm"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            color={editor?.isActive("strike") ? "primary" : "secondary"}
            >
            <FaStrikethrough />
          </Button>
          <Button
            isIconOnly variant="faded" size="sm"
            onClick={toggleParagraph}
            color={editor?.isActive("paragraph") ? "primary" : "secondary"}
            >
            <FaParagraph />
          </Button>
          <Button
            isIconOnly variant="faded" size="sm"
            color={editor?.isActive("heading", { level: 1 }) ? "primary" : "secondary"}
            onClick={() => toggleHeading(1)}
            >
            <MdTitle />
          </Button>
          <Button
            isIconOnly variant="faded" size="sm"
            onClick={() => setIsModalOpen(true)}
            color="secondary"
            >
            <FaLink />
          </Button>
          <Button
            isIconOnly variant="faded" size="sm"
            onClick={() => setIsHtmlMode(!isHtmlMode)} // Alterna o modo HTML
            color={isHtmlMode ? "primary" : "secondary"}
            >
            {isHtmlMode ? <IoText /> : <FaCode />}
          </Button>
        </ButtonGroup>
      </div>

      {/* Modal para Inserir Link */}
      <Modal
        isOpen={isModalOpen}
        aria-labelledby="modal-title"
        onClose={() => {
          setLinkURL("");
          setIsModalOpen(false);
        }}
      >
        <ModalContent>
          <ModalHeader>Inserir Link</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              color="primary"
              size="lg"
              placeholder="Insira a URL do link"
              value={linkURL}
              onChange={(e) => setLinkURL(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={applyLink}>Inserir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Área de edição */}
      {isHtmlMode ? (
        <textarea
          value={editor?.getHTML() || ""}
          onChange={(e) => handleHtmlChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[200px] p-3 border dark:border-gray-700 border-gray-300 rounded"
        />
      ) : (
        <EditorContent editor={editor} placeholder={placeholder} />
      )}
    </div>
  );
}
