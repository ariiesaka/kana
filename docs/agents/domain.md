# domain docs

How engineering skills should consume domain documentation when exploring this repository.

## before exploring

- Read root GLOSSARY.md, or GLOSSARY-MAP.md if it exists. A map points to context-specific glossaries; read each one relevant to the topic.
- Read relevant decisions under docs/adr/. In a multi-context repository, also check src/<context>/docs/adr/.
- If these files do not exist, proceed without creating them up front. Create them when terms or decisions are actually resolved.

## use the glossary vocabulary

When naming a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term defined in GLOSSARY.md. Do not drift to synonyms that the glossary explicitly avoids.

If the concept is not in the glossary, reconsider whether it belongs in this project or record the gap for domain modeling.

## flag conflicts

If an implementation contradicts an existing ADR, surface the conflict rather than silently overriding the decision.
