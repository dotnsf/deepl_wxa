# DeepL translate API combined with WxA(Watsonx Assistant)

## Overview

DeepL translate API


## Environment values

- `AUTHKEY` : DeepL AuthKey(required)

- `BASE_URL` : DeepL API Base URL(default: `https://api-free.deepl.com`)

- `CORS` : URL if CORS would be enabled(default: ``)

- `PORT` : Port web application(default: `8080`)


## APIs

- `POST /api/pre_wxa`

  - Input/Output JSON data should be like followings:

```(input JSON)
{
  deepl: {
    source_lang: "en",
    target_lang: "ja"
  },
  params: {
    session_id: "xxxxxx"
  },
  payload: "text in source_lang"
}
```

- `POST /api/post_wxa`

  - Input/Output JSON data should be like followings:

```(input JSON)
{
  deepl: {
    source_lang: "ja",
    target_lang: "en"
  },
  _msgid: "xxxx",
  params: {
    session_id: "xxxxxx"
  },
  payload: {
    user_id: "xxxxx",
    session_id: "xxxxxx",
    output: {
      generic: [
        { response_type: "text", text: "text in source_lang" }, ..
      ],
      intents: [
        { intent: "bye", confidence: 1, skill: "main skill" },
      ],
      entities: [
      ]
    },
    context: { .. }
  },
  req: { .. },
  res: { .. }
}
```


## References

https://www.deepl.com/docs-api/translate-text/


## Difference between free API and standard API

- 無料版では１か月あたり 500,000 文字まで


## Licensing

This code is licensed under MIT.


## Copyright

2025 K.Kimura @ IBM Japan all rights reserved.

