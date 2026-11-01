'use client';

import { useEffect, useRef, useState } from 'react';

const escapeText = (text) => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function initialHtml(value) {
  const text = String(value || '');
  if (/<\/?[a-z][^>]*>/i.test(text)) return text;
  return text.split(/\r?\n/).map(escapeText).join('<br>');
}

function ToolButton({ label, children, onClick }) {
  return (
    <button
      type="button"
      className="lesson-editor-button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function LessonNotesEditor({ value, onChange, onImageUpload, readOnly = false }) {
  const editor = useRef(null);
  const picker = useRef(null);
  const savedSelection = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== initialHtml(value)) {
      editor.current.innerHTML = initialHtml(value);
    }
  }, [value]);

  function rememberSelection() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editor.current?.contains(selection.anchorNode)) {
      savedSelection.current = selection.getRangeAt(0).cloneRange();
    } else if (editor.current && !savedSelection.current) {
      const range = document.createRange();
      range.selectNodeContents(editor.current);
      range.collapse(false);
      savedSelection.current = range;
    }
  }

  function restoreSelection() {
    if (!savedSelection.current || !editor.current) return;
    editor.current.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection.current);
  }

  function format(command, commandValue) {
    if (readOnly || !editor.current) return;
    restoreSelection();
    document.execCommand(command, false, commandValue);
    onChange(editor.current.innerHTML);
    rememberSelection();
  }

  async function insertImage(file) {
    if (!file || !onImageUpload) return;
    setUploading(true);
    setImageError('');
    try {
      const image = await onImageUpload(file);
      restoreSelection();
      const img = `<img src="${escapeText(image.signed_url)}" data-bearilly-image="${escapeText(image.key)}" alt="${escapeText(file.name.replace(/\.[^.]+$/, ''))}" />`;
      document.execCommand('insertHTML', false, img);
      onChange(editor.current.innerHTML);
      rememberSelection();
    } catch (error) {
      setImageError(error.message || 'The image could not be uploaded. Try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="lesson-notes-field">
      <div className="lesson-notes-label">Lesson notes</div>
      <p className="field-hint">
        Format the reading with headings, emphasis, lists and indentation. Insert images where they help explain the lesson.
      </p>
      {!readOnly && (
        <div className="lesson-editor-toolbar" role="toolbar" aria-label="Lesson note formatting">
          <label className="lesson-editor-select-label">
            <span className="sr-only">Text style</span>
            <select
              aria-label="Text style"
              defaultValue="p"
              onMouseDown={rememberSelection}
              onChange={(event) => {
                format('formatBlock', `<${event.target.value}>`);
                event.target.value = 'p';
              }}
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code</option>
            </select>
          </label>
          <span className="lesson-editor-divider" aria-hidden />
          <ToolButton label="Bold" onClick={() => format('bold')}><strong>B</strong></ToolButton>
          <ToolButton label="Italic" onClick={() => format('italic')}><em>I</em></ToolButton>
          <ToolButton label="Underline" onClick={() => format('underline')}><span style={{ textDecoration: 'underline' }}>U</span></ToolButton>
          <ToolButton label="Strikethrough" onClick={() => format('strikeThrough')}><s>S</s></ToolButton>
          <ToolButton label="Bulleted list" onClick={() => format('insertUnorderedList')}>•</ToolButton>
          <ToolButton label="Numbered list" onClick={() => format('insertOrderedList')}>1.</ToolButton>
          <span className="lesson-editor-divider" aria-hidden />
          <ToolButton label="Decrease indentation" onClick={() => format('outdent')}>⇤</ToolButton>
          <ToolButton label="Increase indentation" onClick={() => format('indent')}>⇥</ToolButton>
          <ToolButton label="Align left" onClick={() => format('justifyLeft')}>≡</ToolButton>
          <ToolButton label="Center text" onClick={() => format('justifyCenter')}>≣</ToolButton>
          <ToolButton label="Align right" onClick={() => format('justifyRight')}>⇥</ToolButton>
          <ToolButton label="Justify text" onClick={() => format('justifyFull')}>☰</ToolButton>
          <ToolButton label="Clear formatting" onClick={() => format('removeFormat')}>Tx</ToolButton>
          <span className="lesson-editor-divider" aria-hidden />
          <ToolButton label="Insert divider" onClick={() => format('insertHorizontalRule')}>—</ToolButton>
          <button
            type="button"
            className="lesson-editor-image"
            disabled={uploading}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => picker.current?.click()}
          >
            {uploading ? 'Uploading…' : '＋ Image'}
          </button>
          <input
            ref={picker}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              insertImage(file);
            }}
          />
        </div>
      )}
      <div
        ref={editor}
        className={`lesson-notes lesson-notes-editor${readOnly ? ' lesson-notes-readonly' : ''}`}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        role={readOnly ? undefined : 'textbox'}
        aria-label="Lesson notes content"
        aria-multiline={readOnly ? undefined : 'true'}
        data-placeholder="Write your lesson notes here…"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onBlur={rememberSelection}
        onPaste={(event) => {
          if (readOnly) return;
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
      />
      {imageError && <p className="field-error" role="alert">{imageError}</p>}
      {!readOnly && <p className="field-hint">Images: PNG, JPEG or WebP, up to 3 MB each. Your notes are checked before students see them.</p>}
    </div>
  );
}
