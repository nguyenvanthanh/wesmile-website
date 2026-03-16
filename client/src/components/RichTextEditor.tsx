import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Image as ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="w-10 h-10 p-0"
        >
          <Bold size={16} />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="w-10 h-10 p-0"
        >
          <Italic size={16} />
        </Button>

        <div className="w-px bg-gray-300" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="w-10 h-10 p-0"
        >
          <List size={16} />
        </Button>

        <div className="w-px bg-gray-300" />

        <label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-10 h-10 p-0 cursor-pointer"
            asChild
          >
            <span>
              <ImageIcon size={16} />
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-64 focus:outline-none"
        style={{
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      />
    </div>
  );
}
