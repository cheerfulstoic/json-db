<template>
  <div class="input-group">
    <ckeditor :editor="editor" v-bind:value="value" v-on:input="update_value" v-bind:config="editorConfig"></ckeditor>
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
        plugins: this.plugins(),
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
