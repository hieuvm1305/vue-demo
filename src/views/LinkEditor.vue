<template>
  <div ref="link" class="min-h-[200px] max-w-[600px] border border-stone-400"></div>
</template>

<script>
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, Fragment, Slice } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup'
import '../assets/editor.scss'
// Extend the basic schema to include links
const linkSchema = new Schema({
  nodes: basicSchema.spec.nodes,
  marks: basicSchema.spec.marks.append({
    link: {
      attrs: { href: {} },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (dom) => ({ href: dom.getAttribute('href') })
        }
      ],
      toDOM: (node) => ['a', { ...node.attrs, rel: 'noopener noreferrer', target: '_blank' }, 0]
    }
  })
})

export default {
  name: 'LinkEditor',
  mounted() {
    this.initEditor()
  },
  methods: {
    initEditor() {
      const state = EditorState.create({
        doc: DOMParser.fromSchema(linkSchema).parse(document.createElement('div')),
        plugins: [...exampleSetup({ schema: linkSchema }), this.linkPasteHandler()]
      })

      this.view = new EditorView(this.$refs.link, {
        state
      })
    },
    linkPasteHandler() {
      return new Plugin({
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData.getData('text/plain')
            const urlRegex = /https?:\/\/[^\s]+/g
            if (urlRegex.test(text)) {
              const linkMark = view.state.schema.marks.link.create({ href: text })
              const node = view.state.schema.text(text, [linkMark])
              const fragment = Slice.fromJSON(view.state.schema, { content: [node.toJSON()] })

              const tr = view.state.tr.replaceSelection(fragment)
              view.dispatch(tr)
              return true
            }

            return false
          }
        }
      })
    }
  }
}
</script>

<style>
/* Add your styles here */
a {
  color: blue;
  text-decoration: underline;
  cursor: pointer;
}
</style>
