import '@logseq/libs';
import { BlockEntity } from '@logseq/libs/dist/LSPlugin';

import { onTemplate, capitalizeFirstLetter } from "./qwutils";
import { settingsTemplate } from "./settings";
import axios from "axios";

const pluginName = ["logseq-wikipedia", "Logseq Wikipedia", "logseqWikipedia"]
const extractApiUrl = "wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=1&redirects&origin=*&titles=";

interface WikipediaExtract {
  title: string;
  text: string;
  url: string;
}

function getApiUrl(lang: string): string {
  console.log("DB geturl", `https://${lang}.` + extractApiUrl)
  return `https://${lang}.` + extractApiUrl;
}

function getUrl(title: string, lang: string): string {
  return `https://${lang}.wikipedia.org/wiki/${encodeURI(title)}`;
}

function formatExtractText(extract: WikipediaExtract, searchTerm: string, noParagraphs: number): string {
  const text = extract.text;
  let formattedText: string = "";
  
  //FIXME separate function
  if (logseq.settings.paragraphYN) {
    let split = text.split("==")[0].trim().split("\n");
    console.log("DB format 1", split)
    split = split.splice(0, noParagraphs)
    console.log("DB split", split)
    const tpl = logseq.settings.templatePragraph
    formattedText = split.map((paragraph) => tpl.replace( "{{paragraphText}}", paragraph ) )
      .join("")
      .trim();
  } else {
    formattedText = text.split("==")[0].trim();
  }

  //FIXME separate function
  if (logseq.settings.boldYN) {
    const regex = new RegExp(searchTerm, "i");
    if (regex.test(searchTerm)) formattedText = formattedText.replace(regex, `**${capitalizeFirstLetter(searchTerm)}**`);
  }
  console.log("DB txt", formatExtractText)
  
  //FIXME separate function
  const template = logseq.settings.template
  formattedText = template
    .replace("{{text}}", formattedText)
    .replace("{{searchTerm}}", searchTerm)
    .replace("{{url}}", extract.url);

  return formattedText;
}

async function getWikipediaText(searchTerm: string, lang: string, noParagraphs: number): Promise<string | undefined> {
  const url = getApiUrl(lang) + encodeURIComponent(searchTerm)
  console.log("DB url", url)
  // const finishedText:string = await axios.get(url, { params: { titles: searchTerm } }) // https://github.com/axios/axios/issues/678
  const finishedText:string = await axios.get(url)
      .catch(() => logseq.App.showMsg("Failed to get Wikipedia. Check your internet connection or language prefix.", "error" ))
      .then(async (result:any) => {
        console.log("DD result1", result)
        console.log("DD result2", result.data?.query.pages)
        const [returnKey, returnVal] = Object.entries(result.data?.query.pages)[0]
        if ( returnKey == "-1" ) {
          const msg = (returnVal["invalidreason"]) ? returnVal["invalidreason"] : "No results, try again"
          console.log("DB msg", msg)
          // logseq.App.showMsg(`Error: ${msg}`, "warning") //FIXME bug
          logseq.App.showMsg(`Error: ${msg}`)
          return undefined
        } else {
          const page:any = returnVal
          const extract: WikipediaExtract = {
            title: page.title,
            text: page.extract,
            url: getUrl(page.title, lang),
          };
          console.log("DB extract", extract)
          const formattedText = formatExtractText(extract, searchTerm, noParagraphs);
          return formattedText
        }
      }); 
      return finishedText
}


async function insertWikipediaAdvanced(uuid, lang, noParagraphs, query, slot) {
  try {
    const wikiText = await getWikipediaText(
                              query.trim(), 
                              lang,
                              noParagraphs
                              )
    if (wikiText) { await  logseq.Editor.updateBlock(uuid, wikiText) }
    else {
      await logseq.provideUI({
        key: pluginName[0],
        slot,
        template: `{{renderer :${pluginName[2]}, ${lang}, ${noParagraphs},<span style="color: red"> ${query} </span>}} (no results)`,
        reset: true,
        style: { flex: 1 },
      })
    }
  }  catch (error) { console.error(error) } 
}

//FIXME turn this into a wrapper around previous one
async function insertWikipediaSimple(e) {
  try {
    const currentBlock: BlockEntity = await logseq.Editor.getBlock(e.uuid)
    let wikiText = await getWikipediaText(
      currentBlock.content.trim(), 
      logseq.settings.lang,
      logseq.settings.noParagraphs
      )
      if (wikiText) { await logseq.Editor.updateBlock(e.uuid, wikiText) }
  }  catch (error) { console.error(error) } 
}


const main = async () => {
  console.log(`Plugin: ${pluginName[1]} loaded`)

  logseq.useSettingsSchema(settingsTemplate)

  logseq.Editor.registerSlashCommand('look up in Wikipedia', async (e) => await insertWikipediaSimple(e))

  logseq.Editor.registerSlashCommand("insert advanced Wikipedia template", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :${pluginName[2]}, ${logseq.settings.lang}, 2, searchterm }}`)})

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    try {
      const [type, lang, noParagraphs, query ] = payload.arguments
      const uuid = payload.uuid
      
      if (type !== `:${pluginName[2]}`) return
      const templYN = await onTemplate(payload.uuid)

      if ( templYN ) { 
        let errMsg = "Error: This command cannot be used in a template"
        await logseq.provideUI({
          key: pluginName[0],
          slot,
          template: `<span style="color: red">{{renderer ${payload.arguments} }}</span> (${errMsg})`,
          reset: true,
          style: { flex: 1 },
        })
        return 
      }

      console.log(`DB: ${uuid} lang:${lang} nop:${noParagraphs} q:${query}`)
      insertWikipediaAdvanced(uuid, lang, noParagraphs, query, slot)
    } catch (error) { console.error(error) }
  })
}
logseq.ready(main).catch(console.error);