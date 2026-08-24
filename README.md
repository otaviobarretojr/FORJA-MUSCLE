# VITAFIT

Aplicativo simples e funcional para acompanhamento de musculação, cardio e progressão de carga.

## Versão atual

**v4.0.0**

## Padrão semanal

- Segunda: treino de inferiores
- Terça: cardio 20 min
- Quarta: treino de superiores
- Quinta: cardio 40 min
- Sexta: treino de inferiores
- Sábado: cardio 20 min
- Domingo: treino de superiores

## Estrutura ativa

- `index.html` — shell principal
- `css/v4.css` — estilo consolidado
- `js/v4.js` — runtime consolidado
- `manifest.webmanifest` — configuração PWA
- `service-worker.js` — cache/offline mínimo
- `icons/` — ícones do aplicativo
- `tests/` — auditorias de navegação, funcionalidade e offline

## Persistência

Cargas, repetições, séries concluídas, histórico e cardio permanecem em armazenamento local. Os vídeos de treino importados pelo usuário são guardados localmente no IndexedDB, sem recompressão pelo aplicativo.

## Diretriz do produto

A prioridade é manter o VITAFIT pequeno, rápido e previsível. Melhorias futuras devem focar em estabilidade, visualização, ergonomia e desempenho, sem aumentar a complexidade do produto sem necessidade.
