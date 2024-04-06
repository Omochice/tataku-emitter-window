import { Denops } from "https://deno.land/x/denops_std@v6.4.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v6.4.0/function/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v6.4.0/batch/mod.ts";
import {
  assert,
  is,
  PredicateType,
} from "https://deno.land/x/unknownutil@v3.17.2/mod.ts";

const isOption = is.ObjectOf({
  cmd: is.OptionalOf(is.String),
  bufname: is.OptionalOf(is.String),
  filetype: is.OptionalOf(is.String),
});

type Option = PredicateType<typeof isOption>;

const defaultOption: Required<Option> = {
  cmd: "edit",
  bufname: "[scratch]",
  filetype: "",
};

const prepareBuffer = async (
  denops: Denops,
  option: {
    bufname: string;
    filetype: string;
  },
): Promise<number> => {
  const bufnr = await fn.bufadd(denops, option.bufname);
  await batch(denops, async (denops) => {
    await fn.bufload(denops, bufnr);
    await fn.setbufvar(denops, bufnr, "&buftype", "nofile");
    await fn.setbufvar(denops, bufnr, "&filetype", option.filetype);
    await fn.setbufvar(denops, bufnr, "&swapfile", false);
    await fn.deletebufline(denops, bufnr, 1, "$");
  });
  return bufnr;
};

const prepareWindow = async (
  denops: Denops,
  option: Required<Option>,
): Promise<number> => {
  const bufnr = await prepareBuffer(denops, option);
  await denops.cmd(`${option.cmd} +buffer${bufnr}`);
  return bufnr;
};

const emitter = (denops: Denops, option = defaultOption) => {
  assert(option, isOption);
  const state = { isPrepared: false, bufnr: -1 };
  return new WritableStream<string[]>({
    write: async (chunk: string[]) => {
      if (!state.isPrepared) {
        state.bufnr = await prepareWindow(
          denops,
          { ...defaultOption, ...option },
        );
        state.isPrepared = true;
      }
      const linenr = await fn.line(denops, "$");
      const lastLine = await fn.getbufline(denops, state.bufnr, linenr);
      const [currentLine, ...newLines] = chunk.join("").split(/\r?\n/);

      await fn.setbufline(
        denops,
        state.bufnr,
        linenr,
        lastLine + currentLine,
      );
      if (newLines.length > 0) {
        await fn.appendbufline(
          denops,
          state.bufnr,
          linenr,
          newLines,
        );
      }
    },
  });
};

export default emitter;
