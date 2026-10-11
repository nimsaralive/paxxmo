import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { createEditorExtensions } from "@/components/cms/RichEditor";
import { cleanContent } from "@/lib/cms/content";
const instances:Editor[]=[];
const create=(content:string)=>{const editor=new Editor({element:document.createElement('div'),extensions:createEditorExtensions(),content:cleanContent(content)});instances.push(editor);return editor;};
afterEach(()=>instances.splice(0).forEach(editor=>editor.destroy()));
describe('TipTap document round trips',()=>{
 it('reopens images with captions, responsive sizes and media references',()=>{
  const editor=create('<figure><img src="https://example.com/image.webp" alt="A thoughtful team workshop" width="640" height="480" srcset="https://example.com/image.webp 640w" data-media-id="asset-id"><figcaption>Our workshop</figcaption></figure>');
  const html=editor.getHTML();expect(html).toContain('<figcaption>Our workshop</figcaption>');expect(html).toContain('data-media-id="asset-id"');expect(html).toContain('width="640"');
  const reopened=create(html);expect(reopened.getJSON()).toEqual(editor.getJSON());
 });
 it('preserves tables, checklists, rich marks and approved videos',()=>{
  const editor=create('<h2>Section</h2><p><strong>Bold</strong> <u>underline</u> <mark>highlight</mark></p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Done</p></li></ul><table><tbody><tr><th>Column</th></tr><tr><td>Value</td></tr></tbody></table><iframe src="https://www.youtube-nocookie.com/embed/test" title="Workshop"></iframe>');
  const html=editor.getHTML();expect(html).toContain('<table');expect(html).toContain('data-checked="true"');expect(html).toContain('<mark>highlight</mark>');expect(html).toContain('youtube-nocookie.com');
  expect(create(html).getJSON()).toEqual(editor.getJSON());
 });
 it('supports actual undo and redo',()=>{const editor=create('<p>Initial</p>');editor.commands.insertContent('<p>Added story</p>');expect(editor.getText()).toContain('Added story');expect(editor.commands.undo()).toBe(true);expect(editor.getText()).not.toContain('Added story');expect(editor.commands.redo()).toBe(true);expect(editor.getText()).toContain('Added story');});
 it('highlights code while preserving its language',()=>{const editor=create('<pre><code class="language-javascript">const answer = 42;</code></pre>');expect(editor.getHTML()).toContain('language-javascript');expect(editor.view.dom.querySelector('.hljs-keyword')).not.toBeNull();});
});
