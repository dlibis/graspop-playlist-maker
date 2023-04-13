// @ts-nocheck
import { JSDOM } from "jsdom";
import { default as axios } from "axios";
import { graspopLineup } from "./constants";

export const fetchBands = async () => {
  const bands = [];
  const { data: html } = await axios.get(graspopLineup!);
  const { document } = new JSDOM(html).window;

  document
    .querySelectorAll(".artist__name")
    .forEach((el) => bands.push(el.textContent));

  const objectBands = bands.reduce((a, v) => ({ ...a, [v]: v }), {});

  return objectBands;
};
