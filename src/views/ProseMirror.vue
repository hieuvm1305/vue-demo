<template>
  <div class="p-5">
    <h1>ProseMirror be here!</h1>
    <div ref="editor" class="min-h-[200px] max-w-[600px] border border-stone-400"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { DOMParser } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { buildKeymap } from 'prosemirror-example-setup'
import { baseKeymap, toggleMark } from 'prosemirror-commands'
import { history } from 'prosemirror-history'
import '../assets/editor.scss'
import { keymap } from 'prosemirror-keymap'
import { menuBar } from 'prosemirror-menu'
import { buildMenuItems } from 'prosemirror-example-setup'

const editor = ref(null)
let view

const createEditor = () => {
  const initialContent = `<p>Hello, Insert text here!</p>`
  const contentElement = document.createElement('div') //tao content div
  contentElement.innerHTML = initialContent //bind init content
  const doc = DOMParser.fromSchema(schema).parse(contentElement)

  function findTextPosition(doc, pos) {
    const isCharacter = (char) => /\S/.test(char) // character is not " " will be in a word

    let start = pos,
      end = pos
    while (start > 0 && isCharacter(doc.textBetween(start - 1, start))) {
      start--
    }
    while (end < doc.nodeSize && isCharacter(doc.textBetween(end, end + 1))) {
      end++
    }

    return { start, end }
  }

  // function linkPasteHandler() {
  //   return new Plugin({
  //     props: {
  //       handlePaste(view, event) { // xu ly su kien paste
  //         const text = event.clipboardData.getData('text/plain') // lay text tu clip board
  //         const urlRegex = /https?:\/\/[^\s]+/g
  //         if (urlRegex.test(text)) {
  //           // if text is url
  //           const linkMark = view.state.schema.marks.link.create({ href: text })
  //           // mark text as link
  //           const node = view.state.schema.text(text, [linkMark]) // create text node with text url and link Mark
  //           const fragment = Slice.fromJSON(view.state.schema, { content: [node.toJSON()] }) // create fragment to replace with text url

  //           const tr = view.state.tr.replaceSelection(fragment) // transaction to replace text url
  //           view.dispatch(tr)
  //           return true
  //         }

  //         return false
  //       }
  //     }
  //   })
  // }
  const customPlugin = new Plugin({
    props: {
      handleDOMEvents: {
        // mouseup(view, event) {
        //   const selection = view.state.selection;
        //   const { from, to } = selection;
        //   const markStrong = state.schema.marks.strong
        //   const selectedText = view.state.doc.textBetween(from, to);
        //   if (selectedText) {

        //     const hasStrongMark = state.doc.rangeHasMark(from, to, markStrong)
        //     let tr
        //     if (hasStrongMark) {
        //       // If the word already has the strong mark, remove it
        //       tr = view.state.tr.removeMark(from, to, markStrong)
        //     } else {
        //       // If the word does not have the strong mark, add it
        //       tr = view.state.tr.addMark(from, to, markStrong.create())
        //     }
        //     view.dispatch(tr);
        //     return true
        //   }
        // }

      }
    }
  })

  const state = EditorState.create({
    doc,
    plugins: [
      history(),
      keymap({
        'Mod-b': (state, dispatch) => {
          const { $cursor } = state.selection
          // selection được chọn. $cursor là nơi được chọn(vị trí trỏ chuột)
          const markType = state.schema.marks.strong // markType của schema mặc định text strong
          if (!$cursor) {
            // If text is selected, use the default toggleMark command
            //toggleMark nhận vào một markType và trả về 1 hàm (state, dispatch, view?)
            return toggleMark(markType)(state, dispatch)
          }
          // lụm từ mã nguồn toggleMark + gpt
          const { nodeAfter } = $cursor
          // Get after node of doc, if is "", return toggleMark for default command, example "Mot h|ai ba" => "ai ba"
          if (nodeAfter) {
            // If cursor is in the middle of a word, apply bold to the remaining part of the word
            const { start, end } = findTextPosition(state.doc, $cursor.pos)
            // Truyen vào hàm doc của state hiện tại và vị trí pos của anchor
            // trỏ chuột để tìm start, end của word cần bôi đen
            const hasStrongMark = state.doc.rangeHasMark(start, end, markType)
            // check has mark strong in this word, return true or false
            if (dispatch) {
              let tr = state.tr // transaction
              //thêm mark đánh dấu vào nội dung inline với vị trí của từ dc chọn và set to strong text
              if (hasStrongMark) {
                // If the word already has the strong mark, remove it
                tr.removeMark(start, end, markType)
              } else {
                // If the word does not have the strong mark, add it
                tr.addMark(start, end, markType.create())
              }
              dispatch(tr)
            }
            return true
          } else {
            // If cursor is at the end of the document or in an empty node, apply bold as usual
            return toggleMark(markType)(state, dispatch)
          }
        }
      }),
      keymap(baseKeymap),
      keymap(buildKeymap(schema)),
      menuBar({
        content: buildMenuItems(schema).fullMenu
      }),
      customPlugin
    ]
  })

  view = new EditorView(editor.value, {
    state
  })
}
function handleBold(view) {
  const selection = view.state.selection;
  const state = view.state
  const { from, to } = selection;
  const markStrong = state.schema.marks.strong

  const selectedText = view.state.doc.textBetween(from, to);
  if (selectedText) {

    const hasStrongMark = state.doc.rangeHasMark(from, to, markStrong)
    let tr
    if (hasStrongMark) {
      // If the word already has the strong mark, remove it
      tr = view.state.tr.removeMark(from, to, markStrong)
    } else {
      // If the word does not have the strong mark, add it
      tr = view.state.tr.addMark(from, to, markStrong.create())
    }
    view.dispatch(tr);
    return true
  }
}

onMounted(() => {
  createEditor()
  setTimeout(() => {
    handleBold(view)
  }, 5000)
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
