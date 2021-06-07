<template>
  <div class="input-group">
    <ckeditor v-bind:editor="editor" v-bind:model-value="value" v-on:input="update_value" v-bind:config="editorConfig"></ckeditor>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default defineComponent({
  name: 'String',
  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        toolbar: {
          items: [
            'Bold', 'Italic',
            'Link',
            'BulletedList', 'NumberedList',
            'undo', 'redo',
          ]
        }
      }
    }
  },
  props: {
    value: String,
    mode: String,
  },
  emits: ['input'],
  methods: {
    update_value(value: any) {
      this.$emit('input', value)
    },
    plugins() {
      // if (this.mode === 'rich_github_markdown') return([Markdown]); 
      return(undefined);
    }
  },
})
</script>

<style scoped lang="scss"></style>
