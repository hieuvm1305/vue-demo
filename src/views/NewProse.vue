<template>
  <div>
    <div class="p-5 flex justify-center items-center flex-col">
      <div
        ref="editor"
        class="editor min-h-[200px] min-w-[400px] max-w-[600px] border border-stone-400"
      ></div>
      <div>
        <button @click="boldText" class="border px-2 py-2 mr-2">Bold</button>
        <button @click="arrowLeft" class="border px-2 py-2 mr-2">Left</button>
        <button @click="arrowRight" class="border px-2 py-2 mr-2">Right</button>
        <button @click="headCursor" class="border px-2 py-2 mr-2">Head cursor</button>
        <button @click="lastCursor" class="border px-2 py-2 mr-2">Last cursor</button>
        <button @click="replaceText" class="border px-2 py-2 mr-2">Replace</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { schema } from 'prosemirror-schema-basic'
import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import '../assets/prosemirror.scss'
import { toggleMark } from 'prosemirror-commands'
import { keymap } from 'prosemirror-keymap'
import {
  chainCommands,
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock
} from 'prosemirror-commands'
const editor = ref(null)
let view
const initEditor = () => {
  let state = EditorState.create({
    schema,
    plugins: [
      keymap({
        // add enter
        Enter: chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock)
      })
    ]
  })

  view = new EditorView(editor.value, {
    state,
    dispatchTransaction(transaction) {
      console.log(
        'Document size went from',
        transaction.before.content.size,
        'to',
        transaction.doc.content.size
      )
      let newState = view.state.apply(transaction)
      view.updateState(newState)
    }
  })
}
const headCursor = () => {
  view.focus()
  const { dispatch, state } = view
  const selection = state.selection
  const { $from } = selection
  const startOfLinePos = $from.start()
  // Muốn nhảy về đầu doc thì pos = 0, cuối doc thì pos = state.doc.content.size
  const tr = state.tr.setSelection(TextSelection.create(state.doc, startOfLinePos))
  dispatch(tr)
  return true
}
const lastCursor = () => {
  view.focus()
  const { dispatch, state } = view
  const selection = state.selection
  const { $from } = selection
  const endOfLinePos = $from.end()
  const tr = state.tr.setSelection(TextSelection.create(state.doc, endOfLinePos))
  dispatch(tr)
  return true
}
const replaceText = () => {
  const { dispatch, state } = view
  console.log(state.doc.content.size)
  const selection = state.selection
  const {from, to} = selection
  //solution sử dụng replacewith của transform với from, to
  const text = state.schema.text('replace')
  const tr = state.tr.replaceWith(from, to, text )
  dispatch(tr)
  return true
}

const boldText = () => {
  const selection = view.state.selection
  const { state, dispatch } = view
  const { from, to } = selection
  const markStrong = view.state.schema.marks.strong

  if (from == to) return toggleMark(markStrong)(state, dispatch)

  const selectedText = view.state.doc.textBetween(from, to)
  if (selectedText) {
    const hasStrongMark = view.state.doc.rangeHasMark(from, to, markStrong)
    let tr
    if (hasStrongMark) {
      // If the word already has the strong mark, remove it
      tr = view.state.tr.removeMark(from, to, markStrong)
    } else {
      // If the word does not have the strong mark, add it
      tr = view.state.tr.addMark(from, to, markStrong.create())
    }
    view.dispatch(tr)
    return true
  }
}

const arrowRight = () => {
  const { state, dispatch } = view
  const { from } = state.selection
  view.focus()
  if (from) {
    const newPos = from + 1
    const tr = state.tr.setSelection(TextSelection.create(state.doc, newPos))
    dispatch(tr)
    return true
  }
  return true
}

const arrowLeft = () => {
  view.focus()
  const { state, dispatch } = view
  const { from } = state.selection

  if (from) {
    const newPos = from - 1
    if (newPos < 1) return
    const tr = state.tr.setSelection(TextSelection.create(state.doc, newPos))
    dispatch(tr)
    return true
  }
  return true
}
onMounted(() => {
  initEditor()
}),
  onBeforeUnmount(() => {
    if (view) view.destroy()
  })
</script>

<style lang="scss" scoped></style>
