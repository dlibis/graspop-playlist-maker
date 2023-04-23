import { JSDOM } from "jsdom";
import { default as axios } from "axios";
import { graspopLineup } from "@/constants";

export const fetchBands = async () => {
  try {
    const bands: { [k: string]: string } = {};
    const { data: html } = await axios.get(graspopLineup!);
    const { document } = new JSDOM(html).window;

    document.querySelectorAll(".artist__name").forEach((el) => {
      if (el.textContent) {
        bands[el.textContent] = el.textContent;
      }
    });
    return bands;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
