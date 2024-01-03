# tataku-emitter-window 

The emitter module that use window for tataku.vim.

## Contents 

- [Dependencies](tataku-emitter-window-dependencies)
- [Options](tataku-emitter-window-options)
- [Samples](tataku-emitter-window-samples)

## Dependencies 

This plugin needs below:

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [tataku.vim](https://github.com/Omochice/tataku.vim)

## Options 

This module has some options:

- `cmd` 

  Command name to open window.
  Default: `'edit'`
- `bufname` 

  Buffer name.
  Default: `'[scratch]'`
- `filetype` 

  Filetype
  Default: `''`

## Samples 

```vim
let g:tataku_recipes = #{
  \   sample: #{
  \     emitter: #{
  \       name: 'window',
  \       options: #{ cmd: 'enew' },
  \     },
  \   },
  \ }
```

