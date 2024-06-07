import { Schema } from 'prosemirror-model';
import { schema as baseSchema } from 'prosemirror-schema-basic';

const linkMark = {
  attrs: {
    href: {},
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(dom) {
        return { href: dom.getAttribute('href') };
      },
    },
  ],
  toDOM(node) {
    return ['a', { ...node.attrs }, 0];
  },
};

// Extend the base schema with the link mark
export const customSchema = new Schema({
  nodes: baseSchema.spec.nodes,
  marks: baseSchema.spec.marks.append({
    link: linkMark,
  }),
});