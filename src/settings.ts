import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';

export let settingsTemplate: SettingSchemaDesc[] = [  
    {
      key: "lang",
      type: 'string',
      default: "en",
      title: "Default Wikipedia language",
      description: "Language to use when fetching from Wikipedia",
    }, 
    {
      key: "noParagraphs",
      type: 'number',
      default: 1,
      title: "Number of paragraphs",
      description: "How much paragraphs to show from Wikipedia",
    },
    {
      key: "template",
      type: 'string',
      default: "{{text}}\n> [Wikipedia:{{searchTerm}}]({{url}})",
      title: "Default Wikipedia language",
      description: "Set markdown template for extract to be inserted.\nAvailable template variables are {{text}}, {{searchTerm}} and {{url}}",
    }, 
    {
      key: "boldYN",
      type: 'boolean',
      default: true,
      title: "Bold Search Term?",
      description: "If set to true, the first instance of the search term will be **bolded**",
    }, 
    {
      key: "templatePragraph",
      type: 'string',
      default: "> {{paragraphText}}\n>\n",
      title: "Paragraph Template",
      description: "Set markdown template for extract paragraphs to be inserted.\nAvailable template variables are: {{paragraphText}}",
    }, 
    {
      key: "paragraphYN",
      type: 'boolean',
      default: true,
      title: "Use paragraph template?",
      description: "If set to true, the paragraph template will be inserted for each paragraph of text for {{text}} in main template.",
    }    
  ]