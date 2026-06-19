'use client';

import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCEEditor({ value, onEditorChange, height = 400 }) {
    return (
        <Editor
            apiKey="2ynva9q28qhx9bv959e24zywnc0zngkixss4y09fxl5ke4of"
            value={value || ''}
            onEditorChange={onEditorChange}
            init={{
                height,
                menubar: false,
                plugins: ['advlist', 'autolink', 'lists', 'link', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table'],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #374151; }',
            }}
        />
    );
}
