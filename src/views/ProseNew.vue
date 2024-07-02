<template>
    <div class="p-5">
        <h1>ProseMirror be here!</h1>
        <div ref="editor" class="editor min-h-[200px] max-w-[600px] border border-stone-400"></div>
        <input type="file" @change="uploadImage" />
    </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { EditorState, NodeSelection, Plugin, Selection, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { DOMParser, Schema } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { buildInputRules, buildKeymap } from 'prosemirror-example-setup'
import { baseKeymap, toggleMark, joinUp, joinDown, joinTextblockBackward } from 'prosemirror-commands'
import { history } from 'prosemirror-history'
import '../assets/prosemirror.scss'
import { keymap } from 'prosemirror-keymap'
import { menuBar } from 'prosemirror-menu'
import { buildMenuItems } from 'prosemirror-example-setup'
import { addListNodes } from 'prosemirror-schema-list'
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"

const editor = ref(null)
let view

const mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
})

const initEditor = () => {
    const initialContent = `<p></p>`
    const contentElement = document.createElement('div') //tao content div
    contentElement.innerHTML = initialContent //bind init content
    const doc = DOMParser.fromSchema(mySchema).parse(contentElement)

    // command sẽ được kích hoạt khi sử dụng key press hoặc các menu, mỗi khi user bấm phím hoặc click menu button,
    // thì hàm thực hiện transaction đươc định nghĩa cho command đó sẽ được gọi, ví dụ khi bấm nút b thì sẽ thực hiện toggleMark() tương tự như Ctrl B
    //

    const state = EditorState.create({
        doc,
        plugins: [
            history(),
            buildInputRules(mySchema),
            keymap(baseKeymap),
            keymap(buildKeymap(mySchema)),
            // menuBar({
            //     content: buildMenuItems(mySchema).fullMenu
            // }),
            dropCursor(),
            gapCursor(),
            // keymap({
            //     // "ArrowRight": (state, dispatch) => {

            //     //     const { from } = state.selection
            //     //     console.log(from)
            //     //     if (from) {
            //     //         const newPos = from + 1
            //     //         const tr = state.tr.setSelection(TextSelection.create(state.doc, newPos));
            //     //         dispatch(tr);
            //     //         return true;
            //     //     }
            //     //     return true;
            //     // },
            //     // "ArrowDown": (state, dispatch) => {

            //     //     return true
            //     //     // find newpos
            //     // },
            //     // "Mod-b": (state, dispatch) => {
            //     //     const selection = state.selection;
            //     //     const { from, to } = selection;
            //     //     const markStrong = state.schema.marks.strong

            //     //     if (from == to) return toggleMark(markStrong)(state, dispatch)

            //     //     const selectedText = state.doc.textBetween(from, to);
            //     //     if (selectedText) {
            //     //         const hasStrongMark = state.doc.rangeHasMark(from, to, markStrong)
            //     //         let tr
            //     //         if (hasStrongMark) {
            //     //             // If the word already has the strong mark, remove it
            //     //             tr = state.tr.removeMark(from, to, markStrong)
            //     //         } else {
            //     //             // If the word does not have the strong mark, add it
            //     //             tr = state.tr.addMark(from, to, markStrong.create())
            //     //         }
            //     //         dispatch(tr);
            //     //         return true
            //     //     }
            //     // }
            // })
        ]
    });

    view = new EditorView(editor.value, {
        state
    })

    view.focus()

}

const uploadImage = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target.result;
            const { schema } = view.state
            const imageNode = schema.nodes.image.create({ src: url });  // tạo node image với src
            const transaction = view.state.tr.replaceSelectionWith(imageNode); //replace current selection with imageNode
            view.dispatch(transaction);
        };
        reader.readAsDataURL(file);
    }
}

onMounted(() => {
    initEditor()
}),
    onBeforeUnmount(() => {
        if (view) view.destroy()
    })
</script>

<style>
a {
    color: #0075ff;
    text-decoration: underline;
    cursor: pointer;
}
</style>