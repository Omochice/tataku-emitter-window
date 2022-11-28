import { Denops } from "https://deno.land/x/denops_std@v3.8.1/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.8.1/function/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v3.8.1/helper/mod.ts";
import { Emitter } from "https://raw.githubusercontent.com/Omochice/tataku.vim/master/denops/tataku/interface.ts";

export default class implements Emitter {
  constructor(private readonly option: Record<string, unknown>) {
  }

  run(denops: Denops, source: string[]) {
    await execute(denops, `${option.cmd ?? "enew"}`);
    const bufnr = await fn.bufnr(denops);
    await fn.setbufvar(denops, bufnr, "&buftype", "nofile");
    await fn.setbufline(denops, bufnr, 1, source);
  }
}
