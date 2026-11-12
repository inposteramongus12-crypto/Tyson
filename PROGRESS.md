# PROGRESS — tyson

## Проект
- Папка: `~/what-if-videos/tyson`
- Репозиторий: `inposteramongus12-crypto/Tyson` (ветка `main`)
- Формат: стикмены (скилл what-if-stickmen), шаблон — копия Boxer-streak
- Название: «Что если ты станешь Майком Тайсоном?» — лонг 12–14 мин, русский, голоса ElevenLabs, не больше 4–5 говорящих

## Готово
- Каркас шаблона скопирован: `src/index.ts`, `Long/Short/Sheet.tsx`, `src/engine`, `src/kit`, `src/reference`, `tools/`, `public/fonts`, workflow рендера
- Заглушки сюжета: `src/story/config.ts`, `shots.tsx`, `places.tsx`, `short.ts`, `shortV.tsx`, пустые `timeline.json` и `short-timeline.json`
- `tsc` без ошибок, пробный кадр `Long` с героем из `cast.ts` рендерится

## Ключи ElevenLabs
- В окружении заданы `ELEVENLABS_API_KEY`, `_2`, `_3`, `_4`, `_5`, `_6` (значения нигде не храним)
- ВНИМАНИЕ: по коду инструменты читают не 1–4, а меньше: `tools/eleven-voice.mjs` и `eleven-voice-en.mjs` — только ключи 1 и 2, `tools/eleven.mjs` — только ключ 1. Ключи 3–6 сейчас не используются; чтобы они работали, нужно доработать инструменты

## Дальше
- Выбрать сюжет (3 варианта предложены в чате), потом сценарий → `lines.json`
- Озвучка и рендер не запускались
