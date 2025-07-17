import type { OutlinerNode } from "~/hooks/use-outliner";

export const mainDocuments: OutlinerNode[] = [
  // {
  //   id: "3232395",
  //   content: "My Ephor Braninlift",
  //   parent_id: null,
  //   children: [
  //     {
  //       id: "node_sahfkashfksahfkshakfhsafhksahfk",
  //       content: "Owner",
  //       parent_id: "3232395",
  //       meta_data: {},
  //       children: [
  //         {
  //           id: "node_1752671154027_593",
  //           content: "Hussain Rizvi",
  //           parent_id: "node_sahfkashfksahfkshakfhsafhksahfk",
  //           children: [],
  //           meta_data: {},
  //         },
  //       ],
  //     },
  //     {
  //       id: "node_1752671156653_55",
  //       content: "Purpose",
  //       parent_id: "3232395",
  //       children: [
  //         {
  //           id: "node_1752671161798_713",
  //           content:
  //             "Deeply personalize the Ephor experience by tailoring AI personas to each user’s core beliefs, expertise, and thought processes",
  //           parent_id: "node_1752671156653_55",
  //           children: [],
  //           meta_data: {},
  //         },
  //         {
  //           id: "node_1752671165219_841",
  //           content:
  //             "Evolve sophisticated, long-term AI personas that authentically represent users’ knowledge and viewpoints, enabling autonomous, credible idea expression across social media.",
  //           parent_id: "node_1752671156653_55",
  //           children: [],
  //           meta_data: {},
  //         },
  //         {
  //           id: "node_1752671170547_668",
  //           content:
  //             "Drive an advanced engine for ingesting, analyzing, and interacting with social media content to optimize personas, continuously refining them for greater authenticity, relevance, and impact",
  //           parent_id: "node_1752671156653_55",
  //           children: [],
  //           meta_data: {},
  //         },
  //         {
  //           id: "node_1752671172195_189",
  //           content: "In Scope:",
  //           parent_id: "node_1752671156653_55",
  //           children: [
  //             {
  //               id: "node_1752671187089_100",
  //               content:
  //                 "Building AI personas that mirror each user’s expertise and beliefs.",
  //               parent_id: "node_1752671172195_189",
  //               children: [],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752671974399_773",
  //               content:
  //                 "Autonomous generation and publishing of user-aligned content on social platforms.",
  //               parent_id: "node_1752671172195_189",
  //               children: [],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752671985092_760",
  //               content:
  //                 "Real-time ingestion and processing of social feeds to dynamically update personas.",
  //               parent_id: "node_1752671172195_189",
  //               children: [],
  //               meta_data: {},
  //             },
  //           ],
  //           meta_data: {},
  //         },
  //         {
  //           id: "node_1752671993369_742",
  //           content: "Out of Scope:",
  //           parent_id: "node_1752671156653_55",
  //           children: [
  //             {
  //               id: "node_1752671997694_325",
  //               content:
  //                 "General-purpose AI personas without strong user alignment.",
  //               parent_id: "node_1752671993369_742",
  //               children: [],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752672004203_351",
  //               content:
  //                 "Content processing that does not directly enhance persona authenticity or engagement",
  //               parent_id: "node_1752671993369_742",
  //               children: [],
  //               meta_data: {},
  //             },
  //           ],
  //           meta_data: {},
  //         },
  //       ],
  //       meta_data: {},
  //     },
  //     {
  //       id: "node_1752672021384_609",
  //       content: "DOK4 - SPOV",
  //       parent_id: "3232395",
  //       children: [
  //         {
  //           id: "node_1752672026042_993",
  //           content:
  //             "Single-pipeline LLM architectures are inherently flawed for handling multi-domain expertise—their monolithic structure creates accuracy bottlenecks and erodes user trust as complexity and domain diversity increase. As platform demands expand, these bottlenecks and trust issues become more pronounced, undermining performance across diverse domains.",
  //           parent_id: "node_1752672021384_609",
  //           children: [
  //             {
  //               id: "node_1752672033470_748",
  //               content:
  //                 "Boundary-pushing: Challenges the prevailing acceptance of monolithic pipelines.",
  //               parent_id: "node_1752672026042_993",
  //               children: [],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752672038224_932",
  //               content:
  //                 "Mechanism: Accuracy degradation due to inflexible single-pipeline design.",
  //               parent_id: "node_1752672026042_993",
  //               children: [],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752672043402_273",
  //               content:
  //                 "Counterperspective: Single-pipeline architectures might suffice for simpler tasks, but complexity exposes their critical weaknesses",
  //               parent_id: "node_1752672026042_993",
  //               children: [],
  //               meta_data: {},
  //             },
  //           ],
  //           meta_data: {},
  //         },
  //       ],
  //       meta_data: {},
  //     },
  //     {
  //       id: "node_1752672050289_587",
  //       content: "DOK3 - Insights",
  //       parent_id: "3232395",
  //       children: [
  //         {
  //           id: "node_1752672057896_198",
  //           content:
  //             "Static, profile-based AI personas rapidly lose alignment with user interests, while platforms ingesting real-time engagement and social signals—like X (Twitter) and TikTok—report up to 28–35% higher user retention and authenticity. LinkedIn’s internal pilots show adaptive agents outperforming legacy bots in content relevance and session duration.",
  //           parent_id: "node_1752672050289_587",
  //           children: [
  //             {
  //               id: "node_1752672062480_329",
  //               content: "Supports: SPOV 1, 5",
  //               parent_id: "node_1752672057896_198",
  //               children: [],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752672067311_69",
  //               content:
  //                 "References: OpenAI, Anthropic, Mollick, X AI, TikTok AI\nBy 2026, leading platforms—including X (Twitter), LinkedIn, and TikTok—will phase out static, profile-based AI personas, replacing them with real-time adaptive agents that learn from trending topics and live user engagement. Platforms slow to adopt will lo",
  //               parent_id: "node_1752672057896_198",
  //               children: [],
  //               meta_data: {},
  //             },
  //           ],
  //           meta_data: {},
  //         },
  //       ],
  //       meta_data: {},
  //     },
  //     {
  //       id: "node_1752672076583_885",
  //       content: "DOK2 - Knowledge Tree",
  //       parent_id: "3232395",
  //       children: [
  //         {
  //           id: "node_1752672081355_140",
  //           content: "1. 🧠 Dynamic vs. Static Persona Construction",
  //           parent_id: "node_1752672076583_885",
  //           children: [
  //             {
  //               id: "node_1752672085431_688",
  //               content: "DOK1 Facts:",
  //               parent_id: "node_1752672081355_140",
  //               children: [
  //                 {
  //                   id: "node_1752672089408_908",
  //                   content:
  //                     "Static AI personas, updated infrequently, quickly become misaligned with users’ evolving beliefs and tones.",
  //                   parent_id: "node_1752672085431_688",
  //                   children: [],
  //                   meta_data: {},
  //                 },
  //               ],
  //               meta_data: {},
  //             },
  //             {
  //               id: "node_1752672095123_967",
  //               content: "DOK2 Summary:",
  //               parent_id: "node_1752672081355_140",
  //               children: [
  //                 {
  //                   id: "node_1752672096714_929",
  //                   content:
  //                     "Research and field practice confirm that AI personas created once and rarely updated quickly lose relevance. Continuous ingestion of user and social feedback is critical for maintaining authenticity and alignment with the user’s real-world beliefs and tone.",
  //                   parent_id: "node_1752672095123_967",
  //                   children: [],
  //                   meta_data: {},
  //                 },
  //               ],
  //               meta_data: {},
  //             },
  //           ],
  //           meta_data: {},
  //         },
  //       ],
  //       meta_data: {},
  //     },
  //   ],
  //   meta_data: {},
  // },
  // {
  //   id: "323239sdakcmcmcasdfsddsfs",
  //   content: "My Personal Braninlift",
  //   parent_id: null,
  //   children: [
  //     {
  //       id: "node_sahfkashfksahfkshakfhsafhksahfk",
  //       content: "Owner",
  //       parent_id: "323239sdakcmcmcasdfsddsfs",
  //       children: [
  //         {
  //           id: "node_1752671154027_593",
  //           content: "Hussain Rizvi",
  //           parent_id: "node_sahfkashfksahfkshakfhsafhksahfk",
  //           children: [],
  //           meta_data: {},
  //         },
  //       ],
  //       meta_data: {},
  //     },
  //     {
  //       id: "node_1752671156653_55",
  //       content: "Purpose",
  //       parent_id: "323239sdakcmcmcasdfsddsfs",
  //       children: [
  //         {
  //           id: "node_1752671161798_713",
  //           content:
  //             "Deeply personalize the Ephor experience by tailoring AI personas to each user’s core beliefs, expertise, and thought processes",
  //           parent_id: "node_1752671156653_55",
  //           children: [],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //         {
  //           id: "node_1752671165219_841",
  //           content:
  //             "Evolve sophisticated, long-term AI personas that authentically represent users’ knowledge and viewpoints, enabling autonomous, credible idea expression across social media.",
  //           parent_id: "node_1752671156653_55",
  //           children: [],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //         {
  //           id: "node_1752671170547_668",
  //           content:
  //             "Drive an advanced engine for ingesting, analyzing, and interacting with social media content to optimize personas, continuously refining them for greater authenticity, relevance, and impact",
  //           parent_id: "node_1752671156653_55",
  //           children: [],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //         {
  //           id: "node_1752671172195_189",
  //           content: "In Scope:",
  //           parent_id: "node_1752671156653_55",
  //           children: [
  //             {
  //               id: "node_1752671187089_100",
  //               content:
  //                 "Building AI personas that mirror each user’s expertise and beliefs.",
  //               parent_id: "node_1752671172195_189",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752671974399_773",
  //               content:
  //                 "Autonomous generation and publishing of user-aligned content on social platforms.",
  //               parent_id: "node_1752671172195_189",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752671985092_760",
  //               content:
  //                 "Real-time ingestion and processing of social feeds to dynamically update personas.",
  //               parent_id: "node_1752671172195_189",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //           ],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //         {
  //           id: "node_1752671993369_742",
  //           content: "Out of Scope:",
  //           parent_id: "node_1752671156653_55",
  //           children: [
  //             {
  //               id: "node_1752671997694_325",
  //               content:
  //                 "General-purpose AI personas without strong user alignment.",
  //               parent_id: "node_1752671993369_742",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752672004203_351",
  //               content:
  //                 "Content processing that does not directly enhance persona authenticity or engagement",
  //               parent_id: "node_1752671993369_742",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //           ],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //       ],
  //       meta_data: {
  //         isEditing: true,
  //       },
  //     },
  //     {
  //       id: "node_1752672021384_609",
  //       content: "DOK4 - SPOV",
  //       parent_id: "323239sdakcmcmcasdfsddsfs",
  //       children: [
  //         {
  //           id: "node_1752672026042_993",
  //           content:
  //             "Single-pipeline LLM architectures are inherently flawed for handling multi-domain expertise—their monolithic structure creates accuracy bottlenecks and erodes user trust as complexity and domain diversity increase. As platform demands expand, these bottlenecks and trust issues become more pronounced, undermining performance across diverse domains.",
  //           parent_id: "node_1752672021384_609",
  //           children: [
  //             {
  //               id: "node_1752672033470_748",
  //               content:
  //                 "Boundary-pushing: Challenges the prevailing acceptance of monolithic pipelines.",
  //               parent_id: "node_1752672026042_993",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752672038224_932",
  //               content:
  //                 "Mechanism: Accuracy degradation due to inflexible single-pipeline design.",
  //               parent_id: "node_1752672026042_993",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752672043402_273",
  //               content:
  //                 "Counterperspective: Single-pipeline architectures might suffice for simpler tasks, but complexity exposes their critical weaknesses",
  //               parent_id: "node_1752672026042_993",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //           ],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //       ],
  //       meta_data: {
  //         isEditing: true,
  //       },
  //     },
  //     {
  //       id: "node_1752672050289_587",
  //       content: "DOK3 - Insights",
  //       parent_id: "323239sdakcmcmcasdfsddsfs",
  //       children: [
  //         {
  //           id: "node_1752672057896_198",
  //           content:
  //             "Static, profile-based AI personas rapidly lose alignment with user interests, while platforms ingesting real-time engagement and social signals—like X (Twitter) and TikTok—report up to 28–35% higher user retention and authenticity. LinkedIn’s internal pilots show adaptive agents outperforming legacy bots in content relevance and session duration.",
  //           parent_id: "node_1752672050289_587",
  //           children: [
  //             {
  //               id: "node_1752672062480_329",
  //               content: "Supports: SPOV 1, 5",
  //               parent_id: "node_1752672057896_198",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752672067311_69",
  //               content:
  //                 "References: OpenAI, Anthropic, Mollick, X AI, TikTok AI\nBy 2026, leading platforms—including X (Twitter), LinkedIn, and TikTok—will phase out static, profile-based AI personas, replacing them with real-time adaptive agents that learn from trending topics and live user engagement. Platforms slow to adopt will lo",
  //               parent_id: "node_1752672057896_198",
  //               children: [],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //           ],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //       ],
  //       meta_data: {
  //         isEditing: true,
  //       },
  //     },
  //     {
  //       id: "node_1752672076583_885",
  //       content: "DOK2 - Knowledge Tree",
  //       parent_id: "323239sdakcmcmcasdfsddsfs",
  //       children: [
  //         {
  //           id: "node_1752672081355_140",
  //           content: "1. 🧠 Dynamic vs. Static Persona Construction",
  //           parent_id: "node_1752672076583_885",
  //           children: [
  //             {
  //               id: "node_1752672085431_688",
  //               content: "DOK1 Facts:",
  //               parent_id: "node_1752672081355_140",
  //               children: [
  //                 {
  //                   id: "node_1752672089408_908",
  //                   content:
  //                     "Static AI personas, updated infrequently, quickly become misaligned with users’ evolving beliefs and tones.",
  //                   parent_id: "node_1752672085431_688",
  //                   children: [],
  //                   meta_data: {
  //                     isEditing: true,
  //                   },
  //                 },
  //               ],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //             {
  //               id: "node_1752672095123_967",
  //               content: "DOK2 Summary:",
  //               parent_id: "node_1752672081355_140",
  //               children: [
  //                 {
  //                   id: "node_1752672096714_929",
  //                   content:
  //                     "Research and field practice confirm that AI personas created once and rarely updated quickly lose relevance. Continuous ingestion of user and social feedback is critical for maintaining authenticity and alignment with the user’s real-world beliefs and tone.",
  //                   parent_id: "node_1752672095123_967",
  //                   children: [],
  //                   meta_data: {
  //                     isEditing: true,
  //                   },
  //                 },
  //               ],
  //               meta_data: {
  //                 isEditing: true,
  //               },
  //             },
  //           ],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //       ],
  //       meta_data: {
  //         isEditing: true,
  //       },
  //     },
  //   ],
  //   meta_data: {},
  // },
  // {
  //   id: "dfasfasfjljh43j3ljl34j3",
  //   content: "Scratchpad",
  //   parent_id: null,
  //   children: [
  //     {
  //       id: "node_sahfkashfksahfkshakfhsafhksahfk",
  //       content: "heading 1",
  //       parent_id: "dfasfasfjljh43j3ljl34j3",
  //       children: [
  //         {
  //           id: "node_1752671154027_593",
  //           content: "Hussain Rizvi",
  //           parent_id: "node_sahfkashfksahfkshakfhsafhksahfk",
  //           children: [],
  //           meta_data: {
  //             isEditing: true,
  //           },
  //         },
  //       ],
  //       meta_data: {},
  //     },
  //   ],
  //   meta_data: {},
  // },
  // {
  //   id: "sfdasfdsfsafsafasfsafsafv",
  //   content: "Scratchpad 2",
  //   parent_id: null,
  //   children: [],
  //   meta_data: {},
  // },
];
