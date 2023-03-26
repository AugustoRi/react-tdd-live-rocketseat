# CheckLastEventStatus UseCase

> ## Dados
* ID do Grupo

> ## Fluxo Primário
- [x] Obter os dados do último evento do grupo (data de término e duração do mercado de notas)
- [x] Retornar status "ativo" se o evento ainda não foi encerrado

> ## Fluxo alternativo: Evento está no limite do encerramento
- [x] Retornar status "ativo"

> ## Fluxo alternativo: Evento encerrado, mas está dentro do período do mercado de notas
- [x] Retornar status "em revisão"

> ## Fluxo alternativo: Evento e mercado de notas encerrados
- [x] Retornar status "encerrado"

> ## Fluxo alternativo: Grupo não tem nenhum evento marcado
- [x] Retornar status "encerrado"